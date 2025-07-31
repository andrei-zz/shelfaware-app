import { forwardRef, useMemo, useState } from "react";
import {
  type PressEvent,
  usePress,
  useLongPress,
  mergeProps,
} from "react-aria";
import type { FocusableElement } from "@react-types/shared";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "~/lib/utils";
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

const defaultLongPressDescription: string = "Show options";

type ItemDropdown = {
  key?: string;
  label?: React.ReactNode;
  onSelect?: React.ComponentProps<typeof DropdownMenuCheckboxItem>["onSelect"];
  props?: Omit<
    React.ComponentProps<typeof DropdownMenuCheckboxItem>,
    "onSelect"
  >;
};

type CtxMenuOwnProps = {
  features?: (
    | "right-click"
    | "long-press"
    | "shift-enter"
    | "click"
    | "tooltip"
    | "checkbox"
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
  dropdownMenuItemProps?: Omit<
    React.ComponentProps<typeof DropdownMenuItem>,
    "children"
  >;
  dropdownMenuCheckboxItemProps?: Omit<
    React.ComponentProps<typeof DropdownMenuCheckboxItem>,
    "children"
  >;
  tooltipProps?: React.ComponentProps<typeof Tooltip>;
  tooltipTriggerProps?: React.ComponentProps<typeof TooltipTrigger>;
  tooltipContentProps?: React.ComponentProps<typeof TooltipContent>;
};

type CtxMenuBaseProps = CtxMenuOwnProps & {
  asChild?: boolean;
  children?: React.ReactNode;
};

export type CtxMenuProps =
  | (CtxMenuBaseProps &
      Omit<React.ComponentProps<"button">, keyof CtxMenuOwnProps>)
  | (CtxMenuBaseProps & { asChild: true } & Omit<
        React.ComponentProps<typeof Slot>,
        keyof CtxMenuOwnProps | "children"
      >);

const CtxMenuWrapper = (
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
    dropdownMenuItemProps,
    dropdownMenuCheckboxItemProps,
    tooltipProps,
    tooltipTriggerProps,
    tooltipContentProps,
    ...props
  }: CtxMenuProps,
  ref: React.Ref<HTMLButtonElement> | React.Ref<React.ElementRef<typeof Slot>>
) => {
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
        if (
          onPress &&
          !features?.includes("click") &&
          (!features?.includes("shift-enter") || !e.shiftKey)
        ) {
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
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ref={ref as any}
                  {...props}
                  {...mergedProps}
                  className={cn("", props.className)}
                >
                  {children}
                </Comp>
              </TooltipTrigger>
            </ContextMenuTrigger>
          </DropdownMenuTrigger>
          {!ctxMenuContent && !dropdownItems ? null : (
            <DropdownMenuContent
              collisionPadding={16}
              {...dropdownMenuContentProps}
            >
              {ctxMenuContent ?? (
                <>
                  {dropdownItems?.map((item: ItemDropdown, i) => {
                    return features?.includes("checkbox") ? (
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
                    ) : (
                      <DropdownMenuItem
                        key={item.key ?? i}
                        onSelect={item.onSelect}
                        {...dropdownMenuItemProps}
                        {...item.props}
                      >
                        {item.label ?? item.props?.children}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuArrow className="fill-border" />
                </>
              )}
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
};
CtxMenuWrapper.displayName = "CtxMenu";

export const CtxMenu = forwardRef(CtxMenuWrapper);
