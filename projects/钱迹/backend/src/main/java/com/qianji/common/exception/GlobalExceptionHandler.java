package com.qianji.common.exception;

import com.qianji.common.api.ApiErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    ResponseEntity<ApiErrorResponse> handleBusiness(BusinessException exception, ServerWebExchange exchange) {
        return ResponseEntity.status(exception.status())
                .body(ApiErrorResponse.of(exception.code(), exception.getMessage(), exchange.getRequest().getPath().value()));
    }

    @ExceptionHandler(WebExchangeBindException.class)
    ResponseEntity<ApiErrorResponse> handleValidation(WebExchangeBindException exception, ServerWebExchange exchange) {
        String message = exception.getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + "：" + error.getDefaultMessage())
                .orElse("请求参数不正确");
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.of("VALIDATION_ERROR", message, exchange.getRequest().getPath().value()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ApiErrorResponse> handleResponseStatus(ResponseStatusException exception, ServerWebExchange exchange) {
        String message = exception.getReason() == null ? "请求处理失败" : exception.getReason();
        return ResponseEntity.status(exception.getStatusCode())
                .body(ApiErrorResponse.of("REQUEST_ERROR", message, exchange.getRequest().getPath().value()));
    }

    @ExceptionHandler(Throwable.class)
    ResponseEntity<ApiErrorResponse> handleUnexpected(Throwable exception, ServerWebExchange exchange) {
        log.error("未处理的服务异常", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiErrorResponse.of("INTERNAL_ERROR", "服务暂时不可用", exchange.getRequest().getPath().value()));
    }
}
