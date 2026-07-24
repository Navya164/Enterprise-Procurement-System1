package pms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "procurement_categories")
public class ProcurementCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String categoryName;

    private String categoryCode;

    private String description;

    public ProcurementCategory() {
    }

    public ProcurementCategory(String categoryName, String categoryCode, String description) {
        this.categoryName = categoryName;
        this.categoryCode = categoryCode;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCategoryCode() {
        return categoryCode;
    }

    public void setCategoryCode(String categoryCode) {
        this.categoryCode = categoryCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}