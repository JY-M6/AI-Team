package com.qianji.auth.repository;

import com.qianji.auth.domain.UserSessionEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface UserSessionRepository extends ReactiveCrudRepository<UserSessionEntity, Long> {

    Mono<UserSessionEntity> findByRefreshTokenHashAndRevokedAtIsNull(String refreshTokenHash);
}
