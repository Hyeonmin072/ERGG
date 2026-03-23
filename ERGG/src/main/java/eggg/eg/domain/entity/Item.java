package eggg.eg.domain.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;


@Entity
public class Item {

    @Id
    public int itemId;
    public String itemName;
}
