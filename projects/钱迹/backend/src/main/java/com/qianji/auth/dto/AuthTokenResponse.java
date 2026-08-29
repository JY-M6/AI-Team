package com.qianji.auth.dto;

public record AuthTokenResponse(
        String tokenType,
        String accessToken,
        long expiresInSeconds,
        String refreshToken,
        UserSummary user
) {

    public record UserSummary(String id, String nickname) {
    }
}
