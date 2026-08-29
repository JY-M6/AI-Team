package com.qianji.user;

public record UserProfileResponse(
        String id,
        String nickname,
        String avatarUrl,
        String status,
        boolean privacyMode
) {
}
