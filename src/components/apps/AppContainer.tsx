"use client";

import type { AppId } from "@/types";
import { HomeApp } from "./HomeApp";
import { AboutApp } from "./AboutApp";
import { ProjectsApp } from "./ProjectsApp";
import { ContactApp } from "./ContactApp";
import { TerminalApp } from "./TerminalApp";
import { CalculatorApp } from "./CalculatorApp";
import { PhotosApp } from "./PhotosApp";
import { TrashApp } from "./TrashApp";
import { CodeApp } from "./code/CodeApp";

interface AppContainerProps {
  appId: AppId;
  windowId: string;
  route?: string;
}

export function AppContainer({ appId, windowId, route }: AppContainerProps) {
  switch (appId) {
    case "home":
      return <HomeApp />;
    case "about":
      return <AboutApp windowId={windowId} />;
    case "projects":
      return <ProjectsApp windowId={windowId} route={route} />;
    case "contact":
      return <ContactApp />;
    case "terminal":
      return <TerminalApp />;
    case "calculator":
      return <CalculatorApp />;
    case "photos":
      return <PhotosApp />;
    case "trash":
      return <TrashApp />;
    case "code":
      return <CodeApp />;
    default:
      return null;
  }
}
