import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CarouselApi } from "../carousel/types";
import type { KeyboardEvent } from "react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../carousel/Carousel";
import { DirectionProvider } from "../DirectionProvider";
import { Input } from "../Input";
import { Button } from "../Button";
import { CarouselGalleryExample } from "./helpers";

const meta: Meta<typeof Carousel> = {
  title: "shadcn-alexgorbatchev/components/Carousel",
  component: Carousel,
  tags: ["autodocs", "test"],
  args: { "aria-label": "Featured projects", onKeyDown: fn(), opts: { duration: 0 } },
  argTypes: { orientation: { control: "select", options: ["horizontal", "vertical"] } },
  render: function Render(args) {
    const [api, setApi] = useState<CarouselApi>();
    const [slide, setSlide] = useState(1);
    useEffect(() => {
      if (!api) return;
      const update = (): void => setSlide(api.selectedScrollSnap() + 1);
      update();
      api.on("select", update);
      return () => {
        api.off("select", update);
      };
    }, [api]);
    return (
      <div className="flex flex-col gap-panel p-12">
        <Carousel {...args} setApi={setApi} className="w-64">
          <CarouselContent className={args.orientation === "vertical" ? "h-48" : undefined}>
            {Array.from({ length: 3 }, (_, index) => (
              <CarouselItem key={index} aria-label={`${index + 1} of 3`}>
                <div className="flex h-full min-h-40 flex-col items-center justify-center gap-control-gap border border-border p-panel">
                  <span>Project {index + 1}</span>
                  <Input aria-label={`Project ${index + 1} caption`} defaultValue="Caption" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <output aria-label="Current slide">{slide} of 3</output>
      </div>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const previous = canvas.getByRole("button", { name: "Previous slide" });
    const next = canvas.getByRole("button", { name: "Next slide" });
    await expect(previous).toBeDisabled();
    await waitFor(() => expect(next).toBeEnabled());
    await userEvent.click(next);
    await waitFor(() => expect(canvas.getByLabelText("Current slide")).toHaveTextContent("2 of 3"));
    canvas.getByRole("region", { name: "Featured projects" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(canvas.getByLabelText("Current slide")).toHaveTextContent("3 of 3"));
    await expect(next).toBeDisabled();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByLabelText("Current slide")).toHaveTextContent("2 of 3");
    await expect(args.onKeyDown).toHaveBeenCalled();
  },
};
export const Vertical: Story = {
  args: { orientation: "vertical" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("button", { name: "Next slide" })).toBeEnabled());
    canvas.getByRole("region", { name: "Featured projects" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByLabelText("Current slide")).toHaveTextContent("2 of 3");
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByLabelText("Current slide")).toHaveTextContent("1 of 3");
    const slide = canvas.getByRole("group", { name: "1 of 3" });
    const caption = canvas.getByRole("textbox", { name: "Project 1 caption" });
    await expect(caption.getBoundingClientRect().bottom).toBeLessThanOrEqual(slide.getBoundingClientRect().bottom);
    const viewport = slide.parentElement?.parentElement;
    await expect(viewport).not.toBeNull();
    await expect(caption.getBoundingClientRect().bottom).toBeLessThanOrEqual(viewport!.getBoundingClientRect().bottom);
    const previous = canvas.getByRole("button", { name: "Previous slide" }).querySelector("path");
    const next = canvas.getByRole("button", { name: "Next slide" }).querySelector("path");
    await expect(previous).not.toBeNull();
    await expect(next).not.toBeNull();
    const previousPoint = previous!.getPointAtLength(previous!.getTotalLength() / 2);
    const nextPoint = next!.getPointAtLength(next!.getTotalLength() / 2);
    const previousTip = new DOMPoint(previousPoint.x, previousPoint.y).matrixTransform(previous!.getScreenCTM()!);
    const nextTip = new DOMPoint(nextPoint.x, nextPoint.y).matrixTransform(next!.getScreenCTM()!);
    const previousBox = previous!.getBoundingClientRect(),
      nextBox = next!.getBoundingClientRect();
    await expect(previousTip.y).toBeLessThan(previousBox.top + previousBox.height / 2);
    await expect(nextTip.y).toBeGreaterThan(nextBox.top + nextBox.height / 2);
  },
};
export const RightToLeft: Story = {
  args: { opts: { direction: "rtl", duration: 0 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("button", { name: "Next slide" })).toBeEnabled());
    canvas.getByRole("region", { name: "Featured projects" }).focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByLabelText("Current slide")).toHaveTextContent("2 of 3");
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByLabelText("Current slide")).toHaveTextContent("1 of 3");
  },
};
export const NestedControl: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("button", { name: "Next slide" })).toBeEnabled());
    await userEvent.click(canvas.getByRole("textbox", { name: "Project 1 caption" }));
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByLabelText("Current slide")).toHaveTextContent("1 of 3");
  },
};
export const KeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("textbox", { name: "Project 1 caption" });
    await userEvent.click(first);
    await userEvent.tab();
    const second = canvas.getByRole("textbox", { name: "Project 2 caption" });
    await expect(second).toHaveFocus();
    await expect(canvas.getByLabelText("Current slide")).toHaveTextContent("2 of 3");
    const viewport = canvas
      .getByRole("region", { name: "Featured projects" })
      .querySelector('[data-slot="carousel-content"]');
    await expect(viewport).not.toBeNull();
    await waitFor(() =>
      expect(second.getBoundingClientRect().left).toBeGreaterThanOrEqual(viewport!.getBoundingClientRect().left),
    );
    await expect(second.getBoundingClientRect().right).toBeLessThanOrEqual(viewport!.getBoundingClientRect().right);
    await userEvent.tab({ shift: true });
    await expect(first).toHaveFocus();
    await expect(canvas.getByLabelText("Current slide")).toHaveTextContent("1 of 3");
  },
};
export const KeyboardFocusRtl: Story = { ...KeyboardFocus, args: { opts: { direction: "rtl", duration: 0 } } };
export const CancelledKeyboard: Story = {
  args: { onKeyDown: fn((event: KeyboardEvent<HTMLDivElement>) => event.preventDefault()) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("button", { name: "Next slide" })).toBeEnabled());
    canvas.getByRole("region", { name: "Featured projects" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.onKeyDown).toHaveBeenCalled();
    await expect(canvas.getByLabelText("Current slide")).toHaveTextContent("1 of 3");
    await userEvent.click(canvas.getByRole("button", { name: "Next slide" }));
    await expect(canvas.getByLabelText("Current slide")).toHaveTextContent("2 of 3");
  },
};
export const Compact: Story = {
  ...Horizontal,
  args: { density: "compact" },
  play: async (context) => {
    await Horizontal.play?.(context);
    await expect(
      within(context.canvasElement).getByRole("textbox", { name: "Project 2 caption" }).getBoundingClientRect().height,
    ).toBe(20);
  },
};
export const Loop: Story = {
  args: { opts: { loop: true, duration: 0 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const previous = canvas.getByRole("button", { name: "Previous slide" });
    await waitFor(() => expect(previous).toBeEnabled());
    await userEvent.click(previous);
    await expect(canvas.getByLabelText("Current slide")).toHaveTextContent("3 of 3");
    await userEvent.click(canvas.getByRole("button", { name: "Next slide" }));
    await expect(canvas.getByLabelText("Current slide")).toHaveTextContent("1 of 3");
  },
};

export const VerticalRtl: Story = {
  ...Vertical,
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <Story />
      </DirectionProvider>
    ),
  ],
};

export const Sizes: Story = {
  render: (args) => <CarouselGalleryExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("group", { name: "1 of 5" });
    const second = canvas.getByRole("group", { name: "2 of 5" });
    const track = first.parentElement!;
    await expect(first.getBoundingClientRect().width / track.getBoundingClientRect().width).toBeCloseTo(0.5);
    const viewport = track.parentElement!.getBoundingClientRect();
    const secondCard = within(second).getByLabelText("Project 2").getBoundingClientRect();
    await expect(secondCard.left).toBeGreaterThanOrEqual(viewport.left);
    await expect(secondCard.right).toBeLessThanOrEqual(viewport.right);
    await waitFor(() => expect(canvas.getByRole("button", { name: "Next slide" })).toBeEnabled());
    await userEvent.click(canvas.getByRole("button", { name: "Next slide" }));
    await expect(canvas.getByLabelText("Gallery snap")).toHaveTextContent("2");
    await userEvent.click(canvas.getByRole("button", { name: "Previous slide" }));
    await expect(canvas.getByLabelText("Gallery snap")).toHaveTextContent("1");
  },
};
export const SizesRtl: Story = { ...Sizes, decorators: VerticalRtl.decorators };
export const ResponsiveSizes: Story = {
  render: (args) => <CarouselGalleryExample {...args} hasResponsiveSizes />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const next = canvas.getByRole("button", { name: "Next slide" });
    await waitFor(() => expect(next).toBeEnabled());
    await userEvent.click(next);
    await expect(canvas.getByLabelText("Gallery snap")).toHaveTextContent("2");
    await userEvent.click(canvas.getByRole("button", { name: "Previous slide" }));
    await expect(canvas.getByLabelText("Gallery snap")).toHaveTextContent("1");
  },
};
export const ResponsiveSizesRtl: Story = { ...ResponsiveSizes, decorators: VerticalRtl.decorators };
export const Spacing: Story = {
  render: (args) => <CarouselGalleryExample {...args} hasWideSpacing />,
  play: async (context) => {
    await Sizes.play?.(context);
    const canvas = within(context.canvasElement);
    const cards = [canvas.getByLabelText("Project 1"), canvas.getByLabelText("Project 2")]
      .map((card) => card.getBoundingClientRect())
      .sort((first, second) => first.left - second.left);
    await expect(cards[1]!.left - cards[0]!.right).toBe(32);
  },
};
export const SpacingRtl: Story = { ...Spacing, decorators: VerticalRtl.decorators };
export const CancelledNext: Story = {
  render: (args) => <CarouselGalleryExample {...args} isNavigationCancelled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const next = canvas.getByRole("button", { name: "Next slide" });
    await waitFor(() => expect(next).toBeEnabled());
    await userEvent.click(next);
    await expect(canvas.getByLabelText("Gallery snap")).toHaveTextContent("1");
  },
};
export const CancelledNextRtl: Story = { ...CancelledNext, decorators: VerticalRtl.decorators };

export const Api: Story = {
  render: function Render(args) {
    const [api, setApi] = useState<CarouselApi>();
    const [count, setCount] = useState(3);
    const [snap, setSnap] = useState(1);
    const [snaps, setSnaps] = useState(0);
    useEffect(() => {
      if (!api) return;
      const update = (): void => {
        setSnap(api.selectedScrollSnap() + 1);
        setSnaps(api.scrollSnapList().length);
      };
      update();
      api.on("select", update);
      api.on("reInit", update);
      return () => {
        api.off("select", update);
        api.off("reInit", update);
      };
    }, [api]);
    return (
      <div className="flex flex-col items-start gap-panel p-12">
        <Carousel {...args} setApi={setApi} className="w-64">
          <CarouselContent>
            {Array.from({ length: count }, (_, index) => (
              <CarouselItem key={index} aria-label={`${index + 1} of ${count}`}>
                <div className="flex min-h-40 items-center justify-center border border-border">
                  Project {index + 1}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="flex gap-control-gap">
          <Button disabled={!api} onClick={() => api?.scrollTo(snaps - 1, true)}>
            Go to last project
          </Button>
          <Button onClick={() => setCount(count + 1)}>Add project</Button>
        </div>
        <output aria-label="API selection">
          {snap} of {snaps}
        </output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByLabelText("API selection")).toHaveTextContent("1 of 3"));
    await userEvent.click(canvas.getByRole("button", { name: "Go to last project" }));
    await expect(canvas.getByLabelText("API selection")).toHaveTextContent("3 of 3");
    await expect(canvas.getByRole("button", { name: "Next slide" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Add project" }));
    await waitFor(() => expect(canvas.getByLabelText("API selection")).toHaveTextContent("3 of 4"));
    await expect(canvas.getByRole("button", { name: "Next slide" })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: "Next slide" }));
    await expect(canvas.getByLabelText("API selection")).toHaveTextContent("4 of 4");
    await expect(canvas.getByRole("group", { name: "4 of 4" })).toHaveTextContent("Project 4");
  },
};
export const ApiRtl: Story = { ...Api, decorators: VerticalRtl.decorators };

export const AutoplayPlugin: Story = {
  render: function Render(args) {
    const [plugin] = useState(() => Autoplay({ playOnInit: false, delay: 1000, jump: true }));
    const [api, setApi] = useState<CarouselApi>();
    const [snap, setSnap] = useState(1);
    const [isPlaying, setPlaying] = useState(false);
    useEffect(() => {
      if (!api) return;
      const select = (): void => setSnap(api.selectedScrollSnap() + 1);
      const play = (): void => setPlaying(true),
        stop = (): void => setPlaying(false);
      api.on("select", select);
      api.on("autoplay:play", play);
      api.on("autoplay:stop", stop);
      return () => {
        api.off("select", select);
        api.off("autoplay:play", play);
        api.off("autoplay:stop", stop);
      };
    }, [api]);
    return (
      <div className="flex flex-col items-start gap-panel p-12">
        <Carousel {...args} setApi={setApi} plugins={[plugin]} className="w-64">
          <CarouselContent>
            {Array.from({ length: 3 }, (_, index) => (
              <CarouselItem key={index} aria-label={`${index + 1} of 3`}>
                <div className="flex min-h-40 flex-col items-center justify-center gap-panel border border-border p-panel">
                  <span>Project {index + 1}</span>
                  <Input aria-label={`Project ${index + 1} caption`} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="flex gap-control-gap">
          <Button disabled={!api || isPlaying} onClick={() => plugin.play()}>
            Start autoplay
          </Button>
          <Button disabled={!isPlaying} onClick={() => plugin.stop()}>
            Stop autoplay
          </Button>
        </div>
        <output aria-label="Autoplay state">{isPlaying ? "Playing" : "Paused"}</output>
        <output aria-label="Autoplay slide">{snap}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("button", { name: "Start autoplay" })).toBeEnabled());
    await expect(canvas.getByLabelText("Autoplay state")).toHaveTextContent("Paused");
    await userEvent.click(canvas.getByRole("button", { name: "Start autoplay" }));
    await expect(canvas.getByLabelText("Autoplay state")).toHaveTextContent("Playing");
    await waitFor(() => expect(canvas.getByLabelText("Autoplay slide")).toHaveTextContent("2"), { timeout: 5000 });
    await userEvent.click(canvas.getByRole("textbox", { name: "Project 2 caption" }));
    await userEvent.tab();
    await expect(canvas.getByRole("textbox", { name: "Project 3 caption" })).toHaveFocus();
    await expect(canvas.getByLabelText("Autoplay state")).toHaveTextContent("Paused");
    await userEvent.click(canvas.getByRole("button", { name: "Start autoplay" }));
    await expect(canvas.getByLabelText("Autoplay state")).toHaveTextContent("Playing");
    await userEvent.click(canvas.getByRole("button", { name: "Stop autoplay" }));
    await expect(canvas.getByLabelText("Autoplay state")).toHaveTextContent("Paused");
  },
};
export const AutoplayPluginRtl: Story = { ...AutoplayPlugin, decorators: VerticalRtl.decorators };

export const CustomNavigation: Story = {
  render: function Render(args) {
    const [isLocked, setLocked] = useState(false);
    const [isCancelled, setCancelled] = useState(true);
    return (
      <div className="flex flex-col items-start gap-panel p-48">
        <Carousel {...args} opts={{ duration: 0 }} className="w-64">
          <CarouselContent>
            {["First", "Second", "Third"].map((label) => (
              <CarouselItem key={label} aria-label={label}>
                <div className="flex h-40 items-center justify-center border border-border">{label}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            size="default"
            className={(state) => (state.disabled ? "w-40" : "w-32")}
            disabled={isLocked}
            onClick={(event) => {
              if (isCancelled) event.preventDefault();
            }}
          >
            Earlier project
          </CarouselPrevious>
          <CarouselNext size="default" variant="secondary" className={() => "w-32"} disabled={isLocked}>
            Later project
          </CarouselNext>
        </Carousel>
        <Button onClick={() => setLocked(!isLocked)}>{isLocked ? "Unlock navigation" : "Lock navigation"}</Button>
        <Button onClick={() => setCancelled(false)}>Allow earlier project</Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const earlier = canvas.getByRole("button", { name: "Earlier project" });
    const later = canvas.getByRole("button", { name: "Later project" });
    await expect(earlier).toBeDisabled();
    await waitFor(() => expect(later).toBeEnabled());
    const disabledWidth = earlier.getBoundingClientRect().width;
    await userEvent.click(later);
    await waitFor(() => expect(earlier).toBeEnabled());
    await expect(earlier.getBoundingClientRect().width).toBeLessThan(disabledWidth);
    const first = canvas.getByRole("group", { name: "First" });
    const position = first.getBoundingClientRect().x;
    await userEvent.click(earlier);
    await expect(first.getBoundingClientRect().x).toBe(position);
    await userEvent.click(canvas.getByRole("button", { name: "Lock navigation" }));
    await expect(earlier).toBeDisabled();
    await expect(later).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Unlock navigation" }));
    await expect(earlier).toBeEnabled();
    await expect(later).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: "Allow earlier project" }));
    await userEvent.click(earlier);
    await waitFor(() => expect(earlier).toBeDisabled());
    await expect(first.getBoundingClientRect().x).toBeGreaterThan(position);
  },
};

export const UnhandledKeyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const carousel = canvas.getByRole("region", { name: "Featured projects" });
    await waitFor(() => expect(canvas.getByRole("button", { name: "Next slide" })).toBeEnabled());
    carousel.focus();
    await userEvent.keyboard("{Home}{End}{ArrowUp}{ArrowDown}");
    await expect(canvas.getByLabelText("Current slide")).toHaveTextContent("1 of 3");
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByLabelText("Current slide")).toHaveTextContent("2 of 3");
  },
};
