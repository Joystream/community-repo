const moment = require("moment");
export const cleanup = (ids: any[], cutoffDate: Date) => {
  let cleaned = 0;
  ids.reduceRight(function (acc, item, index, object) {
    if (item.createdAt < cutoffDate) {
      object.splice(index, 1);
      cleaned += 1;
    }
  }, []);
};

export const lookup = (ids: any[], id: string) => {
  for (let video of ids) {
    if (video.id === id) {
      return true;
    }
  }
  return false;
};

export const durationFormat = (duration: number) => {
  if (duration < 60) {
    return `${duration}s.`;
  } else {
    return moment.duration(duration, "seconds").format("hh:mm:ss");
  }
};
