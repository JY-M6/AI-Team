package com.qianji.user;

import com.qianji.common.api.ApiResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    Mono<ApiResponse<UserProfileResponse>> me(@AuthenticationPrincipal Jwt jwt) {
        return userService.getProfile(Long.valueOf(jwt.getSubject())).map(ApiResponse::success);
    }
}
