package com.qianji.user;

import com.qianji.auth.repository.UserRepository;
import com.qianji.common.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Mono<UserProfileResponse> getProfile(Long userId) {
        return userRepository.findByIdAndDeletedAtIsNull(userId)
                .switchIfEmpty(Mono.error(new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "用户不存在")))
                .map(user -> new UserProfileResponse(
                        user.id().toString(), user.nickname(), user.avatarUrl(), user.status(), user.privacyMode()));
    }
}
