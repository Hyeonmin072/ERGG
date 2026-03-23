package eggg.eg.domain.entity;

import jakarta.persistence.Id;

public class Player {

    @Id
    public int userNum;

    public String nickName;
}
