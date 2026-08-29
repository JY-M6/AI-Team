package com.qianji.auth.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("user_auths")
public record UserAuthEntity(
        @Id Long id,
        Long userId,
        String provider,
        String providerUid,
        String credentialHash,
        boolean verified,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static UserAuthEntity username(Long userId, String username, String passwordHash, LocalDateTime now) {
        return new UserAuthEntity(null, userId, "USERNAME", username, passwordHash, true, now, now);
    }
}
