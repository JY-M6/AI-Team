package com.qianji.auth.service;

import com.qianji.auth.domain.UserAuthEntity;
import com.qianji.auth.domain.UserEntity;
import com.qianji.auth.domain.UserSessionEntity;
import com.qianji.auth.dto.AuthTokenResponse;
import com.qianji.auth.dto.LoginRequest;
import com.qianji.auth.dto.RefreshTokenRequest;
import com.qianji.auth.dto.RegisterRequest;
import com.qianji.auth.repository.UserAuthRepository;
import com.qianji.auth.repository.UserRepository;
import com.qianji.auth.repository.UserSessionRepository;
import com.qianji.common.exception.BusinessException;
import com.qianji.config.JwtProperties;
import com.qianji.ledger.AccountEntity;
import com.qianji.ledger.AccountRepository;
import com.qianji.ledger.LedgerEntity;
import com.qianji.ledger.LedgerRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserAuthRepository userAuthRepository;
    private final UserSessionRepository userSessionRepository;
    private final LedgerRepository ledgerRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    public AuthService(
            UserRepository userRepository,
            UserAuthRepository userAuthRepository,
            UserSessionRepository userSessionRepository,
            LedgerRepository ledgerRepository,
            AccountRepository accountRepository,
            PasswordEncoder passwordEncoder,
            RefreshTokenService refreshTokenService,
            JwtService jwtService,
            JwtProperties jwtProperties
    ) {
        this.userRepository = userRepository;
        this.userAuthRepository = userAuthRepository;
        this.userSessionRepository = userSessionRepository;
        this.ledgerRepository = ledgerRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
    }

    @Transactional
    public Mono<AuthTokenResponse> register(RegisterRequest request) {
        String username = normalizeUsername(request.username());
        return userAuthRepository.existsByProviderAndProviderUid("USERNAME", username)
                .flatMap(exists -> exists
                        ? Mono.error(new BusinessException(HttpStatus.CONFLICT, "USERNAME_EXISTS", "用户名已被使用"))
                        : encodePassword(request.password()))
                .flatMap(passwordHash -> createUserWithDefaults(request, username, passwordHash))
                .onErrorMap(DataIntegrityViolationException.class,
                        exception -> new BusinessException(HttpStatus.CONFLICT, "USERNAME_EXISTS", "用户名已被使用"));
    }

    public Mono<AuthTokenResponse> login(LoginRequest request) {
        String username = normalizeUsername(request.username());
        return userAuthRepository.findByProviderAndProviderUid("USERNAME", username)
                .switchIfEmpty(invalidCredentials())
                .flatMap(auth -> verifyPassword(request.password(), auth.credentialHash())
                        .flatMap(matches -> matches ? Mono.just(auth) : invalidCredentials()))
                .flatMap(auth -> userRepository.findByIdAndDeletedAtIsNull(auth.userId()))
                .filter(user -> "ACTIVE".equals(user.status()))
                .switchIfEmpty(Mono.error(new BusinessException(HttpStatus.FORBIDDEN, "USER_DISABLED", "账号不可用")))
                .flatMap(user -> createSessionTokens(user, request.deviceId(), request.deviceName()));
    }

    @Transactional
    public Mono<AuthTokenResponse> refresh(RefreshTokenRequest request) {
        String tokenHash = refreshTokenService.hash(request.refreshToken());
        LocalDateTime now = now();
        return userSessionRepository.findByRefreshTokenHashAndRevokedAtIsNull(tokenHash)
                .filter(session -> session.expiresAt().isAfter(now))
                .switchIfEmpty(Mono.error(new BusinessException(
                        HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "刷新令牌无效或已过期")))
                .flatMap(session -> userRepository.findByIdAndDeletedAtIsNull(session.userId())
                        .filter(user -> "ACTIVE".equals(user.status()))
                        .switchIfEmpty(Mono.error(new BusinessException(
                                HttpStatus.FORBIDDEN, "USER_DISABLED", "账号不可用")))
                        .flatMap(user -> rotateSessionTokens(user, session, now)));
    }

    @Transactional
    public Mono<Void> logout(Long userId, Long sessionId) {
        return userSessionRepository.findById(sessionId)
                .filter(session -> session.userId().equals(userId))
                .flatMap(session -> session.revokedAt() == null
                        ? userSessionRepository.save(session.revoke(now())).then()
                        : Mono.empty());
    }

    private Mono<AuthTokenResponse> createUserWithDefaults(
            RegisterRequest request,
            String username,
            String passwordHash
    ) {
        LocalDateTime now = now();
        return userRepository.save(UserEntity.active(request.nickname().trim(), now))
                .flatMap(user -> userAuthRepository.save(
                                UserAuthEntity.username(user.id(), username, passwordHash, now))
                        .then(ledgerRepository.save(LedgerEntity.defaultLedger(user.id(), now)))
                        .flatMap(ledger -> createDefaultAccounts(user.id(), ledger.id(), now)
                                .then(createSessionTokens(user, request.deviceId(), request.deviceName()))));
    }

    private Mono<Void> createDefaultAccounts(Long userId, Long ledgerId, LocalDateTime now) {
        List<AccountEntity> accounts = List.of(
                AccountEntity.empty(userId, ledgerId, "现金", "CASH", now),
                AccountEntity.empty(userId, ledgerId, "微信", "WECHAT", now),
                AccountEntity.empty(userId, ledgerId, "支付宝", "ALIPAY", now)
        );
        return Flux.fromIterable(accounts).concatMap(accountRepository::save).then();
    }

    private Mono<AuthTokenResponse> createSessionTokens(UserEntity user, String deviceId, String deviceName) {
        LocalDateTime now = now();
        String refreshToken = refreshTokenService.generate();
        UserSessionEntity session = new UserSessionEntity(
                null,
                user.id(),
                refreshTokenService.hash(refreshToken),
                trimToNull(deviceId),
                trimToNull(deviceName),
                now.plus(jwtProperties.refreshTokenTtl()),
                null,
                now
        );
        return userSessionRepository.save(session)
                .map(saved -> tokenResponse(user, saved.id(), refreshToken));
    }

    private Mono<AuthTokenResponse> rotateSessionTokens(
            UserEntity user,
            UserSessionEntity session,
            LocalDateTime now
    ) {
        String refreshToken = refreshTokenService.generate();
        UserSessionEntity rotated = session.rotate(
                refreshTokenService.hash(refreshToken), now.plus(jwtProperties.refreshTokenTtl()));
        return userSessionRepository.save(rotated)
                .map(saved -> tokenResponse(user, saved.id(), refreshToken));
    }

    private AuthTokenResponse tokenResponse(UserEntity user, Long sessionId, String refreshToken) {
        return new AuthTokenResponse(
                "Bearer",
                jwtService.issueAccessToken(user.id(), sessionId),
                jwtProperties.accessTokenTtl().toSeconds(),
                refreshToken,
                new AuthTokenResponse.UserSummary(user.id().toString(), user.nickname())
        );
    }

    private Mono<String> encodePassword(String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            return Mono.error(new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "密码的 UTF-8 编码不能超过 72 字节"));
        }
        return Mono.fromCallable(() -> passwordEncoder.encode(password))
                .subscribeOn(Schedulers.boundedElastic());
    }

    private Mono<Boolean> verifyPassword(String password, String passwordHash) {
        return Mono.fromCallable(() -> passwordEncoder.matches(password, passwordHash))
                .subscribeOn(Schedulers.boundedElastic());
    }

    private <T> Mono<T> invalidCredentials() {
        return Mono.error(new BusinessException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "用户名或密码错误"));
    }

    private String normalizeUsername(String username) {
        return username.trim().toLowerCase(Locale.ROOT);
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private LocalDateTime now() {
        return LocalDateTime.now(ZoneOffset.UTC);
    }
}
