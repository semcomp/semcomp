import Mongoose from "mongoose";

type AdditionalInfos = {
  position: string,
  phone: string,
  linkedin: string,
  admissionYear: string,
  expectedGraduationYear: string,
  expectedGraduationSemester: string,
  institute: string,
  extensionGroups: Object,
  educationLevel: string,
};

type User = {
  id?: string;
  email: string;
  name: string;
  password?: string;
  course?: string;
  discord?: string;
  telegram?: string;
  permission?: boolean;
  resetPasswordCode?: string;
  verificationCode?: string;
  wantNameTag?: boolean;
  paid?: boolean;
  gotKit?: boolean;
  gotTagName?: boolean;
  additionalInfos?: AdditionalInfos;
  createdAt?: number;
  updatedAt?: number;
  verified?: boolean;
}

export default User;
export type { AdditionalInfos };

const UserSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
    },
    course: {
      type: String,
      default: "Não informado",
    },
    discord: {
      type: String,
      default: "Não informado",
    },
    telegram: {
      type: String,
    },
    permission: {
      type: Boolean,
      default: false,
      required: true,
    },
    resetPasswordCode: {
      type: String,
    },
    verificationCode: {
      type: String,
    },
    wantNameTag: {
      type: Boolean,
    },
    paid: {
      type: Boolean,
      default: false,
      required: true,
    },
    gotKit: {
      type: Boolean,
      default: false,
      required: true,
    },
    gotTagName: {
      type: Boolean,
      default: false,
      required: true,
    },
    additionalInfos: {
      type: Object,
      default: null,
      required: false,
    },
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
    verified: {
      type: Boolean,
      default: false,
    },

  },
  { collection: "user" }
);

export const UserModel = Mongoose.model("user", UserSchema);
