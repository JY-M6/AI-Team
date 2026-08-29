package com.qianji.auth.repository;

import com.qianji.auth.domain.UserAuthEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface UserAuthRepository extends ReactiveCrudRepository<UserAuthEntity, Long> {

    Mono<Boolean> existsByProviderAndProviderUid(String provider, String providerUid);

    Mono<UserAuthEntity> findByProviderAndProviderUid(String provider, String providerUid);
}
