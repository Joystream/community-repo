const moment = require("moment");
export const cleanup = (ids: any[], cutoffDate: Date) => {
  console.log("Local storage cleaning in progress");
  let cleaned = 0;
  ids.reduceRight(function (acc, item, index, object) {
    if (item.createdAt < cutoffDate) {
      object.splice(index, 1);
      cleaned += 1;
    }
  }, []);
  if (cleaned > 0) {
    console.log(`Cleaned records: ${cleaned}`);
  }
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
