package com.qianji.auth.repository;

import com.qianji.auth.domain.UserEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface UserRepository extends ReactiveCrudRepository<UserEntity, Long> {

    Mono<UserEntity> findByIdAndDeletedAtIsNull(Long id);
}
