import { TransportPricingEntity } from "../api/transport-pricing/entities/transport-pricing.entity";
import { ETcItemsDesc, ETcPricingItems } from "../enums/tc-pricing-items.enum";

export function getVehicleRateDesc(
  key: string,
  itemVehicleType: any,
  getRate = true,
  tcPricing?: TransportPricingEntity
) {
  switch (key) {
    case ETcPricingItems.miles0_10:
      return getRate
        ? tcPricing.flatRate[itemVehicleType].fee.toFixed(2)
        : ETcItemsDesc[itemVehicleType + ETcPricingItems.miles0_10];
    case ETcPricingItems.milesSurcharge10Plus:
      return getRate
        ? tcPricing.additionalRate[itemVehicleType].fee.toFixed(2)
        : ETcItemsDesc[itemVehicleType + ETcPricingItems.milesSurcharge10Plus];
    case ETcPricingItems.riderNoShow:
      return getRate ? tcPricing.rideNoShow.fee.toFixed(2) : ETcItemsDesc[ETcPricingItems.riderNoShow];
    case ETcPricingItems.sameDayCancellation:
      return getRate ? tcPricing.sameDayCancellation.fee.toFixed(2) : ETcItemsDesc[ETcPricingItems.sameDayCancellation];
    case ETcPricingItems.waitTime:
      return getRate ? tcPricing.waitTime.fee.toFixed(2) : ETcItemsDesc[ETcPricingItems.wait_time];
    case ETcPricingItems.deadheadMileage:
      return getRate ? tcPricing.deadheadMileage.fee.toFixed(2) : ETcItemsDesc[ETcPricingItems.deadheadMileage];
    case ETcPricingItems.overnightRideProgram:
      return getRate ? "0.00" : ETcItemsDesc[ETcPricingItems.overnightRideProgram];
    default:
      return "0.00";
  }
}
