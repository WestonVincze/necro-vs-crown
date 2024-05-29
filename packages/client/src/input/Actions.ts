type ActionCallback = (event?: Event | MouseEvent, extraData?: any) => void;
type ConditionCallback = () => boolean;

type InputBinding = {
  keys?: string[];
  keyCombinations?: string[][];
  mouseEvents?: ('mousedown' | 'mouseup' | 'drag' | 'mousemove' | 'dragstart' | 'dragend')[];
  condition?: ConditionCallback;
};

// TODO: make actions scoped instead of globally managed?
const actions: Record<string, InputBinding & { callback: ActionCallback }> = {};

const defineAction = ({
  name,
  callback,
  binding
}: { name: string, callback: ActionCallback, binding: InputBinding }) => {
  actions[name] = { ...binding, callback };
};

export { actions, defineAction }
