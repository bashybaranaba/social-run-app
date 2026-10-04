import { ObjectId } from "mongodb";
import { z } from "zod";

export const registration = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(128)
});
export const login = registration.pick({ email: true, password: true });
export const runInput = z.object({
  title: z.string().trim().min(3).max(80),
  description: z.string().trim().max(500).default(""),
  startAt: z.iso.datetime(),
  distanceKm: z.number().min(1).max(100),
  paceMin: z.number().min(2.5).max(15),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  placeName: z.string().trim().min(2).max(100)
});
export type Run = {
  _id?: ObjectId;
  hostId: ObjectId;
  title: string;
  description: string;
  startAt: Date;
  distanceKm: number;
  paceMin: number;
  location: { type: "Point"; coordinates: [number, number] };
  placeName: string;
  status: "open" | "matched" | "completed" | "cancelled";
  acceptedUserId?: ObjectId;
  createdAt: Date;
};
export type JoinRequest = {
  _id?: ObjectId;
  runId: ObjectId;
  userId: ObjectId;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
};
export function publicRun(run: Run, viewerId?: ObjectId | null) {
  const isParticipant = !!viewerId && (run.hostId.equals(viewerId) || run.acceptedUserId?.equals(viewerId));
  const [longitude, latitude] = run.location.coordinates;
  return {
    id: run._id?.toString(), hostId: run.hostId.toString(), title: run.title,
    description: run.description, startAt: run.startAt.toISOString(),
    distanceKm: run.distanceKm, paceMin: run.paceMin,
    latitude: isParticipant ? latitude : Math.round(latitude * 100) / 100,
    longitude: isParticipant ? longitude : Math.round(longitude * 100) / 100,
    placeName: run.placeName, status: run.status,
    acceptedUserId: run.acceptedUserId?.toString(),
    createdAt: run.createdAt.toISOString()
  };
}
