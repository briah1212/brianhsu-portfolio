"use client";

import type { AppId } from "@/types";
import { HomeApp } from "./HomeApp";
import { AboutApp } from "./AboutApp";
import { ProjectsApp } from "./ProjectsApp";
import { ContactApp } from "./ContactApp";
import { TerminalApp } from "./TerminalApp";
import { PhotosApp } from "./PhotosApp";

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
      return <AboutApp />;
    case "projects":
      return <ProjectsApp windowId={windowId} route={route} />;
    case "contact":
      return <ContactApp />;
    case "terminal":
      return <TerminalApp />;
    case "photos":
      return <PhotosApp />;
    default:
      return null;
  }
}
