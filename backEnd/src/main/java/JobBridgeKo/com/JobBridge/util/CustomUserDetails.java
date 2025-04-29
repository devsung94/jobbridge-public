package JobBridgeKo.com.JobBridge.util;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
public class CustomUserDetails implements UserDetails {

    private final Long idx; // 사용자 식별자 (DB의 PK)
    private final String username; // 사용자 아이디
    private final String password; // 비밀번호
    private final String email; // 사용자 아이디
    private final String role; // ex) ROLE_USER, ROLE_ADMIN

    public CustomUserDetails(Long idx, String username, String password, String email, String role) {
        this.idx = idx;
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
    }

    // 사용자의 권한 목록 반환 (여기선 하나만 반환)
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(() -> role);
    }

    // 사용자 계정이 만료되지 않았는가?
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    // 사용자 계정이 잠기지 않았는가?
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    // 사용자 인증 정보가 만료되지 않았는가?
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // 사용자 계정이 활성화되어 있는가?
    @Override
    public boolean isEnabled() {
        return true;
    }
}

