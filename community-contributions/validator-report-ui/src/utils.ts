const fromEntries = (xs: [string | number | symbol, any][]) =>
  xs.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export function PromiseAllObj(obj: {
  [k: string]: any;
}): Promise<{ [k: string]: any }> {
  return Promise.all(
    Object.entries(obj).map(([key, val]) =>
      val instanceof Promise
        ? val.then((res) => [key, res])
        : new Promise((res) => res([key, val]))
    )
  ).then((res: any[]) => fromEntries(res));
}
