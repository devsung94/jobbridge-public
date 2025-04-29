package JobBridgeKo.com.JobBridge.util;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Directory;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifIFD0Directory;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.stream.ImageInputStream;
import java.awt.*;
import java.awt.geom.AffineTransform;
import java.awt.image.AffineTransformOp;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Component
public class CommonUtils {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${profile.default-image}")
    private String defaultImage;

    private void ensureUploadDirExists() throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
    }

    public Map<String, String> saveUploadedFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;

        // 🔒 5MB 제한
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("5MB 이하의 파일만 업로드할 수 있습니다.");
        }

        ensureUploadDirExists();

        String originalName = Objects.requireNonNull(file.getOriginalFilename()).replaceAll("[^a-zA-Z0-9.]", "_");
        String extension = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();
        String extensionlessName = originalName.substring(0, originalName.lastIndexOf('.'));
        String fileName = UUID.randomUUID() + "_" + extensionlessName;
        Path filePath;
        String finalFileUrl;

        byte[] imageBytes = file.getBytes();

        try (InputStream inputStream = new ByteArrayInputStream(imageBytes)) {
            BufferedImage bufferedImage = ImageIO.read(inputStream);
            if (bufferedImage != null && extension.matches("jpg|jpeg|png")) {
                String compressedFileName = fileName + "." + extension;
                filePath = Paths.get(uploadDir, compressedFileName);

                BufferedImage corrected = correctOrientation(new ByteArrayInputStream(imageBytes), bufferedImage);

                try (OutputStream os = Files.newOutputStream(filePath)) {
                    Thumbnails.of(corrected)
                            .size(800, 800)
                            .outputFormat(extension)
                            .outputQuality(0.7f)
                            .toOutputStream(os);
                }
                finalFileUrl = "/uploads/" + compressedFileName;
            } else {
                String normalFileName = fileName + "." + extension;
                filePath = Paths.get(uploadDir, normalFileName);
                Files.write(filePath, imageBytes);
                finalFileUrl = "/uploads/" + normalFileName;
            }
        }

        long fileSize = Files.size(Paths.get(uploadDir, fileName + "." + extension));

        Map<String, String> result = new HashMap<>();
        result.put("originalName", originalName);
        result.put("fileUrl", finalFileUrl);
        result.put("fileSize", String.valueOf(fileSize));

        return result;
    }

    public String saveThumbnail(MultipartFile file, String outputFormat) throws IOException {
        if (file == null || file.isEmpty()) return null;

        // 🔒 5MB 제한
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("5MB 이하의 파일만 업로드할 수 있습니다.");
        }

        ensureUploadDirExists();

        String originalName = Objects.requireNonNull(file.getOriginalFilename()).replaceAll("[^a-zA-Z0-9.]", "_");
        String extension = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();

        if (!extension.matches("jpg|jpeg|png")) {
            throw new IllegalArgumentException("지원하지 않는 이미지 확장자입니다: " + extension);
        }

        String format = (outputFormat == null || outputFormat.isBlank()) ? "jpg" : outputFormat.toLowerCase();
        String fileName = UUID.randomUUID() + "_" + originalName.replaceAll("\\.[^.]+$", "") + "." + format;
        Path filePath = Paths.get(uploadDir, fileName);

        byte[] imageBytes = file.getBytes();

        try (ImageInputStream iis = ImageIO.createImageInputStream(new ByteArrayInputStream(imageBytes));
             OutputStream os = Files.newOutputStream(filePath)) {

            if (!ImageIO.getImageReaders(iis).hasNext()) {
                throw new IllegalArgumentException("유효하지 않은 이미지입니다.");
            }

            BufferedImage bufferedImage = ImageIO.read(new ByteArrayInputStream(imageBytes));
            BufferedImage corrected = correctOrientation(new ByteArrayInputStream(imageBytes), bufferedImage);

            Thumbnails.of(corrected)
                    .size(800, 800)
                    .outputFormat(format)
                    .outputQuality(0.7f)
                    .toOutputStream(os);
        }

        return "/uploads/" + fileName;
    }

    private BufferedImage correctOrientation(InputStream imageStream, BufferedImage image) {
        try {
            Metadata metadata = ImageMetadataReader.readMetadata(imageStream);
            Directory directory = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
            if (directory != null && directory.containsTag(ExifIFD0Directory.TAG_ORIENTATION)) {
                int orientation = directory.getInt(ExifIFD0Directory.TAG_ORIENTATION);
                return rotateImage(image, orientation);
            }
        } catch (Exception e) {
            System.out.println("⚠ EXIF 회전 정보 읽기 실패: " + e.getMessage());
        }
        return image;
    }

    private BufferedImage rotateImage(BufferedImage image, int orientation) {
        int width = image.getWidth();
        int height = image.getHeight();
        BufferedImage rotatedImage;
        AffineTransform transform = new AffineTransform();

        switch (orientation) {
            case 6: // 90도 회전
                rotatedImage = new BufferedImage(height, width, image.getType());
                transform.translate(height, 0);
                transform.rotate(Math.toRadians(90));
                break;
            case 3: // 180도 회전
                rotatedImage = new BufferedImage(width, height, image.getType());
                transform.translate(width, height);
                transform.rotate(Math.toRadians(180));
                break;
            case 8: // 270도 회전
                rotatedImage = new BufferedImage(height, width, image.getType());
                transform.translate(0, width);
                transform.rotate(Math.toRadians(270));
                break;
            default:
                return image;
        }

        Graphics2D g2d = rotatedImage.createGraphics();
        g2d.setTransform(new AffineTransformOp(transform, AffineTransformOp.TYPE_BILINEAR).getTransform());
        g2d.drawImage(image, 0, 0, null);
        g2d.dispose();
        return rotatedImage;
    }

    // CommonUtils.java 안에 추가
    public boolean deleteFileByUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return false;

        // 업로드 디렉토리와 상대 경로를 조합
        String cleanedPath = fileUrl.replace("/uploads", ""); // /uploads/abc.jpg -> /abc.jpg
        Path filePath = Paths.get(uploadDir, cleanedPath);

        try {
            return Files.deleteIfExists(filePath); // true면 성공적으로 삭제됨
        } catch (IOException e) {
            System.out.println("⚠ 파일 삭제 실패: " + filePath + " - " + e.getMessage());
            return false;
        }
    }

    public String copyExistingFile(String fileUrl) throws IOException {
        if (fileUrl == null || fileUrl.isBlank()) return null;

        // /uploads/xxx.jpg → xxx.jpg 추출
        String fileName = Paths.get(fileUrl).getFileName().toString();

        // 실제 파일 경로 (절대 경로)
        Path source = Paths.get(uploadDir, fileName);

        if (!Files.exists(source)) {
            throw new FileNotFoundException("원본 파일 없음: " + source.toString());
        }

        String extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        String newFileName = UUID.randomUUID() + "." + extension;

        Path target = Paths.get(uploadDir, newFileName);
        Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + newFileName;
    }


}
