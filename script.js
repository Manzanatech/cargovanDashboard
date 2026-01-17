const timestamp = document.getElementById("timestamp");

const formatTime = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const updateTimestamp = () => {
  if (!timestamp) return;
  timestamp.textContent = formatTime();
};

updateTimestamp();
setInterval(updateTimestamp, 60000);