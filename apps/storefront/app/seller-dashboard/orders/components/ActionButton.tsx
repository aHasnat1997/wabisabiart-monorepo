"use client"
import React from "react"

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  title: string
  subtitle: string
  destructive?: boolean
}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ icon, title, subtitle, destructive, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`flex items-center w-full rounded-xl p-2 gap-3 cursor-pointer hover:bg-muted-foreground/10 ${
          destructive ? "text-destructive border-t-2 hover:bg-destructive/30" : ""
        }`}
        style={destructive ? { boxShadow: "0 -4px 6px -1px rgba(0,0,0,0.2)" } : {}}
        {...props}
      >
        {icon}
        <div className="flex flex-col text-left">
          <h4 className="font-medium">{title}</h4>
          <p className={`text-xs ${destructive ? "text-destructive" : "text-muted-foreground"}`}>
            {subtitle}
          </p>
        </div>
      </button>
    )
  }
)

ActionButton.displayName = "ActionButton"
export default ActionButton
