import { ForwardRefExoticComponent, RefAttributes } from "react";

export type TSVGIcon = ForwardRefExoticComponent<
  Omit<SVGSVGElement, "ref"> & RefAttributes<SVGSVGElement>
>;
