import { useEffect, useMemo, useState } from "react";
import type { Site } from "../types/site";
import {
  calculatePdhesFinancials,
  createCalculationInputsFromExcel,
} from "../utils/pdhes/calculationEngine";
import type { PdhesCalculationInputs } from "../utils/pdhes/types";

export function usePdhesCalculationEngine(site?: Site) {
  const initialInputs = useMemo(
    () => createCalculationInputsFromExcel(site?.excelCalculated),
    [site?.id, site?.excelCalculated?.normalizedName],
  );

  const [inputs, setInputs] = useState<PdhesCalculationInputs>(initialInputs);

  useEffect(() => {
    setInputs(initialInputs);
  }, [initialInputs]);

  const outputs = useMemo(() => calculatePdhesFinancials(inputs), [inputs]);

  const setInput = <K extends keyof PdhesCalculationInputs>(
    key: K,
    value: PdhesCalculationInputs[K],
  ) => {
    setInputs((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return {
    inputs,
    outputs,
    setInput,
    resetInputs: () => setInputs(initialInputs),
  };
}
