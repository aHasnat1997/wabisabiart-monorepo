
const ActiveChart = () => {
  return (
    <div className="flex flex-col h-full justify-between p-4 bg-card rounded-lg shadow-sm">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        <div className="text-xs text-muted-foreground/80">10:30 PM</div>
        <div className="bg-primary/10 text-muted-foreground p-2 rounded-lg max-w-xs">
          Hello!  be happy to help. What would you like to know?
        </div>
        <div className="bg-muted-foreground/10 text-muted-foreground p-2 rounded-lg max-w-xs self-end">
          When will my order be shipped?
        </div>
      </div>
      {/* Input Box */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type your message"
          className="flex-1 border border-muted-foreground/30 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button className="bg-primary text-card px-4 py-2 rounded-lg hover:bg-primary">
          Send
        </button>
      </div>
    </div>
  )
}

export default ActiveChart;
