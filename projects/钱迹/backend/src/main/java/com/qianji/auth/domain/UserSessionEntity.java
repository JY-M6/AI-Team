package com.qianji.auth.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("user_sessions")
public record UserSessionEntity(
        @Id Long id,
        Long userId,
        String refreshTokenHash,
        String deviceId,
        String deviceName,
        LocalDateTime expiresAt,
        LocalDateTime revokedAt,
        LocalDateTime createdAt
) {

    public UserSessionEntity rotate(String tokenHash, LocalDateTime newExpiresAt) {
        return new UserSessionEntity(id, userId, tokenHash, deviceId, deviceName, newExpiresAt, null, createdAt);
    }

    public UserSessionEntity revoke(LocalDateTime now) {
        return new UserSessionEntity(id, userId, refreshTokenHash, deviceId, deviceName, expiresAt, now, createdAt);
    }
}
