package eggg.eg.domain.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;


@Entity
@Getter@Setter
public class Character {

    @Id
    private int characterId;
}
