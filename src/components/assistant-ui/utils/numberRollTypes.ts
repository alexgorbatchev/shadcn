interface INumberRollDigitPart {
  type: "digit";
  key: string;
  digit: number;
}
interface INumberRollSymbolPart {
  type: "symbol";
  key: string;
  value: string;
}
export type NumberRollPartValue = INumberRollDigitPart | INumberRollSymbolPart;
interface INumberRollPartTransition {
  isExiting?: boolean;
  hasEntered?: boolean;
}
export type NumberRollRenderedPart = NumberRollPartValue & INumberRollPartTransition;
