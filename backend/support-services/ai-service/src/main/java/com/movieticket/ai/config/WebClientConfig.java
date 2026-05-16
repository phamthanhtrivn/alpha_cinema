package com.movieticket.ai.config;

import io.netty.channel.ChannelOption;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
@EnableConfigurationProperties({AiServiceProperties.class, AiToolProperties.class})
public class WebClientConfig {

    @Bean
    @LoadBalanced
    public WebClient.Builder aiWebClientBuilder(AiToolProperties toolProperties) {
        long timeoutMs = toolProperties.safeTimeoutMs();
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, (int) Math.min(timeoutMs, Integer.MAX_VALUE))
                .responseTimeout(Duration.ofMillis(timeoutMs));

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient));
    }

    @Bean
    public WebClient movieWebClient(
            @Qualifier("aiWebClientBuilder") WebClient.Builder builder,
            AiServiceProperties properties
    ) {
        return builder.clone()
                .baseUrl(properties.movieServiceUrl())
                .build();
    }

    @Bean
    public WebClient cinemaWebClient(
            @Qualifier("aiWebClientBuilder") WebClient.Builder builder,
            AiServiceProperties properties
    ) {
        return builder.clone()
                .baseUrl(properties.cinemaServiceUrl())
                .build();
    }

    @Bean
    public WebClient userWebClient(
            @Qualifier("aiWebClientBuilder") WebClient.Builder builder,
            AiServiceProperties properties
    ) {
        return builder.clone()
                .baseUrl(properties.userServiceUrl())
                .build();
    }

    @Bean
    public WebClient orderWebClient(
            @Qualifier("aiWebClientBuilder") WebClient.Builder builder,
            AiServiceProperties properties
    ) {
        return builder.clone()
                .baseUrl(properties.orderServiceUrl())
                .build();
    }

    @Bean
    public WebClient ticketWebClient(
            @Qualifier("aiWebClientBuilder") WebClient.Builder builder,
            AiServiceProperties properties
    ) {
        return builder.clone()
                .baseUrl(properties.ticketServiceUrl())
                .build();
    }
}
