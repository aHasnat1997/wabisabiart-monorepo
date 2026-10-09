

import {
  Tabs as TabsPrimitive,
  TabsList as TabsListPrimitive,
  TabsTab as TabsTabPrimitive,
  TabsPanel as TabsPanelPrimitive,
  TabsPanels as TabsPanelsPrimitive,
  TabsHighlight as TabsHighlightPrimitive,
  TabsHighlightItem as TabsHighlightItemPrimitive,
  type TabsProps as TabsPrimitiveProps,
  type TabsListProps as TabsListPrimitiveProps,
  type TabsTabProps as TabsTabPrimitiveProps,
  type TabsPanelProps as TabsPanelPrimitiveProps,
  type TabsPanelsProps as TabsPanelsPrimitiveProps,
} from "@/components/animate-ui/primitives/base/tabs";
import { cn } from "@/lib/utils";

type TabsProps = TabsPrimitiveProps;

function Tabs({ className, ...props }: TabsProps) {
  return (
    <TabsPrimitive
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

type TabsListProps = TabsListPrimitiveProps & {
  highlightClassName?: string; 
};

function TabsList({highlightClassName ,className, ...props }: TabsListProps) {
  return (
    <TabsHighlightPrimitive className={cn("absolute z-0 inset-0 border-b-2 bg-card pb-8 dark:border-input dark:bg-input/30", highlightClassName)}>
      <TabsListPrimitive
        className={cn(
          "text-muted-foreground inline-flex w-fit max-w-full overflow-x-auto items-center justify-start rounded-lg px-6 py-4",
          className,
        )}
        {...props}
      />
    </TabsHighlightPrimitive>
  );
}

type TabsTabProps = TabsTabPrimitiveProps;

function TabsTab({ className, ...props }: TabsTabProps) {
  return (
    <TabsHighlightItemPrimitive value={props.value} className="flex-1">
      <TabsTabPrimitive
        className={cn(
          "data-selected:text-muted-foreground text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md w-full px-2 py-1 text-sm font-semibold whitespace-nowrap transition-colors duration-500 ease-in-out focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
          className,
        )}
        {...props}
      />
    </TabsHighlightItemPrimitive>
  );
}

type TabsPanelsProps = TabsPanelsPrimitiveProps;

function TabsPanels(props: TabsPanelsProps) {
  return <TabsPanelsPrimitive {...props} />;
}

type TabsPanelProps = TabsPanelPrimitiveProps;

function TabsPanel({ className, ...props }: TabsPanelProps) {
  return (
    <TabsPanelPrimitive
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export {
  Tabs,
  TabsList,
  TabsTab,
  TabsPanels,
  TabsPanel,
  type TabsProps,
  type TabsListProps,
  type TabsTabProps,
  type TabsPanelsProps,
  type TabsPanelProps,
};
