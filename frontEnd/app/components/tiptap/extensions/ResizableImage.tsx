// components/tiptap/extensions/ResizableImage.ts
import { Node, mergeAttributes } from "@tiptap/core";

export const ResizableImage = Node.create({
  name: "resizableImage",
  group: "block",
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: "auto" },
      height: { default: "auto" },
      textAlign: { default: "center" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="resizable-image"]',
        getAttrs: (dom: HTMLElement) => {
          const img = dom.querySelector("img");
          return {
            src: img?.getAttribute("src"),
            width: img?.style.width || undefined,
            height: img?.style.height || undefined,
            textAlign: dom.style.textAlign || "center",
          };
        },
      },
    ];
  },


  renderHTML({ HTMLAttributes }) {
    const { textAlign = "center", ...rest } = HTMLAttributes;

    return [
      "div",
      {
        class: "resizable-image-wrapper",
        "data-type": "resizable-image",
        style: `text-align: ${textAlign}; display: block;`,
      },
      [
        "img",
        mergeAttributes(rest, {
          style: `
            width: ${rest.width || "auto"};
            height: ${rest.height || "auto"};
            max-width: 100%;
            object-fit: contain;
            border-radius: 0.5rem;
            display: inline-block;
          `,
        }),
      ],
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("div");
      dom.className = "resizable-image-wrapper";
      dom.contentEditable = "false";
      dom.style.textAlign = node.attrs.textAlign || "center";
      dom.style.display = "block";
      dom.style.position = "relative";

      const img = document.createElement("img");
      img.src = node.attrs.src;
      img.style.width = node.attrs.width || "auto";
      img.style.height = node.attrs.height || "auto";
      img.style.maxWidth = "100%";
      img.style.objectFit = "contain";
      img.style.borderRadius = "0.5rem";
      img.style.display = "inline-block";

      const resizer = document.createElement("div");
      resizer.style.position = "absolute";
      resizer.style.bottom = "0";
      resizer.style.right = "0";
      resizer.style.width = "12px";
      resizer.style.height = "12px";
      resizer.style.background = "#ccc";
      resizer.style.cursor = "nwse-resize";

      resizer.addEventListener("mousedown", (e) => {
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = img.offsetWidth;
        const startHeight = img.offsetHeight;

        const onMouseMove = (e: MouseEvent) => {
          const newWidth = startWidth + (e.clientX - startX);
          const newHeight = startHeight + (e.clientY - startY);
          img.style.width = `${newWidth}px`;
          img.style.height = `${newHeight}px`;

          editor.commands.command(({ tr }) => {
            const pos = typeof getPos === "function" ? getPos() : null;
            if (typeof pos !== "number") return false;

            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              width: `${newWidth}px`,
              height: `${newHeight}px`,
            });
            return true;
          });
        };

        const onMouseUp = () => {
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      });

      dom.appendChild(img);
      dom.appendChild(resizer);

      return { dom };
    };
  },
});