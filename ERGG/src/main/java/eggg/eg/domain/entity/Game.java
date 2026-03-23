package eggg.eg.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int gameId;

    @OneToMany
    private GameDetail gameDetail;

    private Integer seasonId;

    @Column(length = 50)
    private String matchingMode;

    @Column(length = 50)
    private String matchingTeamMode;

    private LocalDateTime startDtm;

    private Integer duration; // 초 단위

    @Column(length = 50)
    private String mapType;

    @Column(length = 20)
    private String gameVersion;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


}
