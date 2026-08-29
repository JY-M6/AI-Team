package com.qianji.system;

import com.qianji.common.api.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/system")
public class SystemStatusController {

    @GetMapping("/status")
    Mono<ApiResponse<SystemStatus>> status() {
        return Mono.just(ApiResponse.success(new SystemStatus("qianji-backend", "UP")));
    }

    record SystemStatus(String service, String status) {
    }
}
