const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    const isSameYear = date.getFullYear() === now.getFullYear();

    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const timeStr = date.toLocaleTimeString('en-US', timeOptions);

    if (isToday) {
        return timeStr;
    }

    if (isSameYear) {
        return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`;
    }

    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${timeStr}`;
};

const now = new Date();
const today = now.getTime();
const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
const lastYear = new Date(now); lastYear.setFullYear(now.getFullYear() - 1);

console.log("Testing Today:", formatMessageTime(today));
console.log("Testing Yesterday:", formatMessageTime(yesterday.getTime()));
console.log("Testing Last Year:", formatMessageTime(lastYear.getTime()));
