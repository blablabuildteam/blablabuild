import { type ComponentPropsWithoutRef } from "react"
import React from "react"

import { cn } from "@/lib/utils"

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean
  /**
   * Content to be displayed in the marquee
   */
  children: React.ReactNode
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean
  /**
   * Number of copies of the content (for seamless infinite loop; animation runs forever)
   * @default 8
   */
  repeat?: number
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = true,
  children,
  vertical = false,
  repeat = 8,
  ...props
}: MarqueeProps) {
  const childArray = React.Children.toArray(children)

  return (
    <div
      {...props}
      className={cn(
        "group flex flex-nowrap overflow-hidden p-2 [--duration:40s] [--gap:1rem]",
        !vertical && "flex-row",
        vertical && "flex-col",
        className
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, copyIndex) => (
          <div
            key={copyIndex}
            className={cn(
              "flex shrink-0 flex-nowrap items-center",
              !vertical && "animate-marquee flex-row",
              vertical && "animate-marquee-vertical flex-col",
              {
                "group-hover:[animation-play-state:paused]": pauseOnHover,
                "[animation-direction:reverse]": reverse,
              }
            )}
          >
            {childArray.map((child, i) => (
              <div
                key={`${copyIndex}-${i}`}
                className="shrink-0 min-w-max"
                style={{
                  marginRight: i < childArray.length - 1 ? "var(--gap)" : undefined,
                  marginBottom: vertical && i < childArray.length - 1 ? "var(--gap)" : undefined,
                }}
              >
                {child}
              </div>
            ))}
          </div>
        ))}
    </div>
  )
}
