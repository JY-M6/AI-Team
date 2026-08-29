package com.qianji.auth.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("users")
public record UserEntity(
        @Id Long id,
        String nickname,
        String avatarUrl,
        byte[] phoneCiphertext,
        String phoneHash,
        String status,
        boolean privacyMode,
        long version,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime deletedAt
) {

    public static UserEntity active(String nickname, LocalDateTime now) {
        return new UserEntity(null, nickname, null, null, null, "ACTIVE", false, 0, now, now, null);
    }
}
