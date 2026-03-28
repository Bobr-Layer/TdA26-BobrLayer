package cz.projektant_pata.tda26.dto.branch;

import cz.projektant_pata.tda26.model.branch.BranchStatusEnum;
import cz.projektant_pata.tda26.model.branch.BranchTypeEnum;
import cz.projektant_pata.tda26.model.branch.RegionEnum;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BranchUpdateDTO {
    private String name;
    private String country;
    private String city;
    private String address;
    private String postalCode;
    private RegionEnum region;
    private BranchTypeEnum type;
    private BranchStatusEnum status;
}
