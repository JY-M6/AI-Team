package com.qianji.report;

import com.qianji.common.api.ApiResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/api/v1/calendar/monthly")
    Mono<ApiResponse<ReportResponses.MonthlyCalendar>> calendar(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam Long ledgerId,
            @RequestParam String month
    ) {
        return reportService.calendar(Long.valueOf(jwt.getSubject()), ledgerId, month)
                .map(ApiResponse::success);
    }

    @GetMapping("/api/v1/reports/summary")
    Mono<ApiResponse<ReportResponses.Summary>> summary(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam Long ledgerId,
            @RequestParam OffsetDateTime startAt,
            @RequestParam OffsetDateTime endAt
    ) {
        return reportService.summary(Long.valueOf(jwt.getSubject()), ledgerId, startAt, endAt)
                .map(ApiResponse::success);
    }

    @GetMapping("/api/v1/reports/trend")
    Mono<ApiResponse<List<ReportResponses.TrendPoint>>> trend(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam Long ledgerId,
            @RequestParam String granularity,
            @RequestParam OffsetDateTime startAt,
            @RequestParam OffsetDateTime endAt
    ) {
        return reportService.trend(
                        Long.valueOf(jwt.getSubject()), ledgerId, granularity, startAt, endAt)
                .collectList()
                .map(ApiResponse::success);
    }

    @GetMapping("/api/v1/reports/categories")
    Mono<ApiResponse<List<ReportResponses.CategoryItem>>> categories(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam Long ledgerId,
            @RequestParam(defaultValue = "EXPENSE") String type,
            @RequestParam OffsetDateTime startAt,
            @RequestParam OffsetDateTime endAt
    ) {
        return reportService.categories(
                        Long.valueOf(jwt.getSubject()), ledgerId, type, startAt, endAt)
                .collectList()
                .map(ApiResponse::success);
    }
}
