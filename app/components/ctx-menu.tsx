import { forwardRef, useMemo, useState } from "react";
import {
  type PressEvent,
  usePress,
  useLongPress,
  mergeProps,
} from "react-aria";
import type { FocusableElement } from "@react-types/shared";
import { Slot } from "@radix-ui/react-slot";
import {
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ContextMenu, ContextMenuTrigger } from "~/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

const defaultLongPressDescription: string = "Show options";

type ItemDropdown = {
  key?: string;
  label?: string | React.ReactNode;
  onSelect?: React.ComponentProps<typeof DropdownMenuItem>["onSelect"];
  props?: Omit<React.ComponentProps<typeof DropdownMenuItem>, "onSelect">;
};

interface CtxMenuOwnProps {
  features?: (
    | "right-click"
    | "long-press"
    | "shift-enter"
    | "click"
    | "tooltip"
  )[];
  onPress?: (e: PressEvent) => void; // use this instead of onClick for correct behavior
  longPressDescription?: string;
  ctxMenuContent?: React.ReactNode;
  dropdownItems?: ItemDropdown[];
  dropdownMenuValue?: string;
  dropdownMenuProps?: Omit<
    React.ComponentProps<typeof DropdownMenu>,
    "children"
  >;
  dropdownMenuContentProps?: Omit<
    React.ComponentProps<typeof DropdownMenuContent>,
    "children"
  >;
  dropdownMenuCheckboxItemProps?: Omit<
    React.ComponentProps<typeof DropdownMenuCheckboxItem>,
    "children"
  >;
  tooltipProps?: React.ComponentProps<typeof Tooltip>;
  tooltipTriggerProps?: React.ComponentProps<typeof TooltipTrigger>;
  tooltipContentProps?: React.ComponentProps<typeof TooltipContent>;
}
interface CtxMenuBaseProps extends CtxMenuOwnProps {
  asChild?: boolean;
  children?: React.ReactNode;
}

export type CtxMenuProps =
  | (CtxMenuBaseProps &
      Omit<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        keyof CtxMenuOwnProps
      >)
  | (CtxMenuBaseProps & { asChild: true } & Omit<
        React.ComponentPropsWithoutRef<typeof Slot>,
        keyof CtxMenuOwnProps | "children"
      >);

function CtxMenuWrapper(
  {
    asChild,
    children,
    features,
    onPress,
    longPressDescription,
    ctxMenuContent,
    dropdownItems,
    dropdownMenuValue,
    dropdownMenuProps,
    dropdownMenuContentProps,
    dropdownMenuCheckboxItemProps,
    tooltipProps,
    tooltipTriggerProps,
    tooltipContentProps,
    ...props
  }: CtxMenuProps,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: React.Ref<any> // React.Ref<HTMLButtonElement | React.ElementRef<typeof Slot>>
) {
  const Comp = asChild ? Slot : "button";

  const [isTooltipOpen, setIsTooltipOpen] = useState<boolean>(false);
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState<boolean>(false);

  const { pressProps } = usePress({
    onPress: (e: PressEvent) => {
      if (
        (ctxMenuContent || (dropdownItems && dropdownItems.length > 0)) &&
        ((features?.includes("click") && !onPress) ||
          (features?.includes("shift-enter") && e.shiftKey))
      ) {
        setIsDropdownMenuOpen(true);
      } else {
        if (onPress && !features?.includes("click")) {
          onPress(e);
        }
      }
    },
  });

  const { longPressProps } = useLongPress({
    accessibilityDescription:
      longPressDescription ?? defaultLongPressDescription,
    onLongPress: () => setIsDropdownMenuOpen(true),
  });

  const mergedProps: React.DOMAttributes<FocusableElement> = useMemo(
    () =>
      mergeProps(
        pressProps,
        (ctxMenuContent || (dropdownItems && dropdownItems.length > 0)) &&
          features?.includes("long-press")
          ? longPressProps
          : undefined
      ),
    [pressProps, longPressProps, ctxMenuContent, dropdownItems, features]
  );

  return (
    <ContextMenu onOpenChange={setIsDropdownMenuOpen}>
      <Tooltip
        open={features != null && features.includes("tooltip") && isTooltipOpen}
        onOpenChange={setIsTooltipOpen}
        {...tooltipProps}
      >
        <DropdownMenu
          open={isDropdownMenuOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setIsDropdownMenuOpen(isOpen);
            }
          }}
          modal={true}
          {...dropdownMenuProps}
        >
          <DropdownMenuTrigger asChild>
            <ContextMenuTrigger
              asChild
              disabled={
                (!ctxMenuContent &&
                  (!dropdownItems || dropdownItems.length <= 0)) ||
                !features?.includes("right-click")
              }
            >
              <TooltipTrigger asChild {...tooltipTriggerProps}>
                <Comp
                  ref={ref}
                  {...props}
                  {...mergedProps}
                  className={cn("", props.className)}
                >
                  {children}
                </Comp>
              </TooltipTrigger>
            </ContextMenuTrigger>
          </DropdownMenuTrigger>
          {ctxMenuContent ?? !dropdownItems ? null : (
            <DropdownMenuContent
              collisionPadding={16}
              {...dropdownMenuContentProps}
            >
              {dropdownItems.map((item: ItemDropdown, i) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={item.key ?? i}
                    checked={
                      typeof dropdownMenuValue === "string" &&
                      item.key === dropdownMenuValue
                    }
                    onSelect={item.onSelect}
                    {...dropdownMenuCheckboxItemProps}
                    {...item.props}
                  >
                    {item.label ?? item.props?.children}
                  </DropdownMenuCheckboxItem>
                );
              })}
              <DropdownMenuArrow className="fill-border" />
            </DropdownMenuContent>
          )}
          {tooltipContentProps ? (
            <TooltipContent
              {...tooltipContentProps}
              // sideOffset={tooltipContentProps?.sideOffset ?? 2}
              // collisionPadding={tooltipContentProps?.collisionPadding ?? 8}
            />
          ) : null}
        </DropdownMenu>
      </Tooltip>
    </ContextMenu>
  );
}
CtxMenuWrapper.displayName = "CtxMenuWrapper";

export const CtxMenu = forwardRef(CtxMenuWrapper);
