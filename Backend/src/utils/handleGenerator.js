import Channel from "../models/channel.model.js";

const generateBaseHandle = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 30);
};

export const generateHandle = async (name) => {
  const baseHandle = generateBaseHandle(name);
  let handle = baseHandle;
  let suffix = 1;

  while (await Channel.exists({ handle })) {
    handle = `${baseHandle}_${suffix}`;
    if (handle.length > 30) {
      const maxBase = 30 - `_${suffix}`.length;
      handle = `${baseHandle.slice(0, maxBase)}_${suffix}`;
    }
    suffix++;
  }

  return handle;
};
