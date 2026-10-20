import type { ReactElement } from "react";
import type { CarouselApi } from "../carousel/types";
import { useEffect, useState } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { CarouselGalleryExample } from "../stories/helpers";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../carousel/Carousel";
import { DirectionProvider } from "../DirectionProvider";
import { DensityProvider } from "../DensityProvider";
import { ThemeProvider } from "../ThemeProvider";
import "../../../.storybook/preview.css";

function ReducedMotionCarousel(): ReactElement {
  const [api, setApi] = useState<CarouselApi>();
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(1);
  useEffect(() => {
    if (!api) return;
    const update = (): void => {
      setCount(api.scrollSnapList().length);
      setSelected(api.selectedScrollSnap() + 1);
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
    <div className="p-12">
      <Carousel
        aria-label="Grouped projects"
        className="w-64"
        setApi={setApi}
        opts={{
          align: "start",
          duration: 30,
          breakpoints: { "(prefers-reduced-motion: reduce)": { slidesToScroll: 2 } },
        }}
      >
        <CarouselContent>
          {Array.from({ length: 5 }, (_, index) => (
            <CarouselItem key={index} aria-label={`Project ${index + 1}`}>
              <div className="flex min-h-40 items-center justify-center border border-border">Project {index + 1}</div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <output aria-label="Grouped selection">
        {selected} of {count}
      </output>
    </div>
  );
}

test.each(["ltr", "rtl"] as const)("reduced motion preserves native slide grouping in %s", async (direction) => {
  const screen = await render(
    <ThemeProvider forcedTheme="dark">
      <DensityProvider density="compact">
        <DirectionProvider direction={direction}>
          <ReducedMotionCarousel />
        </DirectionProvider>
      </DensityProvider>
    </ThemeProvider>,
  );
  expect(window.matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
  const status = screen.getByRole("status", { name: "Grouped selection" });
  await expect.element(status).toHaveTextContent("1 of 3");
  await screen.getByRole("button", { name: "Next slide" }).click();
  await expect.element(status).toHaveTextContent("2 of 3");
  const viewport = screen
    .getByRole("region", { name: "Grouped projects" })
    .element()
    .querySelector('[data-slot="carousel-content"]');
  expect(viewport).not.toBeNull();
  await expect
    .poll(() =>
      Math.abs(
        screen.getByRole("group", { name: "Project 3" }).element().firstElementChild!.getBoundingClientRect().left -
          viewport!.getBoundingClientRect().left,
      ),
    )
    .toBeLessThan(1);
  await screen.getByRole("button", { name: "Next slide" }).click();
  await expect.element(status).toHaveTextContent("3 of 3");
  await expect.element(screen.getByRole("button", { name: "Next slide" })).toBeDisabled();
});

test.each(["ltr", "rtl"] as const)("responsive gallery resizes native slides in %s", async (direction) => {
  await page.viewport(500, 800);
  const screen = await render(
    <ThemeProvider forcedTheme="dark">
      <DensityProvider density="compact">
        <DirectionProvider direction={direction}>
          <CarouselGalleryExample hasResponsiveSizes opts={{ duration: 0 }} />
        </DirectionProvider>
      </DensityProvider>
    </ThemeProvider>,
  );
  const first = screen.getByRole("group", { name: "1 of 5" }).element();
  const track = first.parentElement!;
  await expect.poll(() => first.getBoundingClientRect().width / track.getBoundingClientRect().width).toBeCloseTo(0.5);
  await page.viewport(1200, 800);
  await expect.poll(() => first.getBoundingClientRect().width / track.getBoundingClientRect().width).toBeCloseTo(1 / 3);
  await screen.getByRole("button", { name: "Next slide" }).click();
  await expect.element(screen.getByRole("status", { name: "Gallery snap" })).toHaveTextContent("2");
  await page.viewport(500, 800);
  await expect.poll(() => first.getBoundingClientRect().width / track.getBoundingClientRect().width).toBeCloseTo(0.5);
  await screen.getByRole("button", { name: "Previous slide" }).click();
  await expect.element(screen.getByRole("status", { name: "Gallery snap" })).toHaveTextContent("1");
});
