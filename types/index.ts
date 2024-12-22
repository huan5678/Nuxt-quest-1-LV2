export interface LoginProps {
  email: string;
  password: string;
}

export interface RegisterProps {
  email: string;
  password: string;
  name: string;
  phone: string;
  birthday: string;
  address: Address;
}

export interface ForgotPasswordProps {
  email: string;
  code: string;
  newPassword: string;
}

export interface UpdateProfileProps {
  userId: string;
  email?: string;
  password?: string;
  newPassword?: string;
  name?: string;
  phone?: string;
  birthday?: string;
  address?: Address;
}

export interface CreateOrderProps {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  peopleNum: number;
  userInfo: UserInfo;
  daysCount: number;
}

export interface UserInfo {
  address: Address;
  name: string;
  phone: string;
  email: string;
}

export interface CheckResponse {
  status: boolean;
  token: string;
}

export interface ApiErrorResponse {
  status: boolean;
  message: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface LoginResponse {
  status: boolean;
  token: string;
  result: UserData;
}

export interface ProfileResponse {
  status: boolean;
  token: string;
  result: UserData;
}

export interface UserData {
  address: Address;
  _id: string;
  name: string;
  email: string;
  phone: string;
  birthday: Date;
  createdAt: Date;
  updatedAt: Date;
  id: string;
}

export interface UserCookie {
  ID: string;
  token: string;
  name: string;
  email: string;
}

export interface Address {
  zipcode: number;
  detail: string;
  city: string;
  county: string;
}

export interface OrderResponse {
  status: boolean;
  result: OrderResult;
}

export interface OrderResult {
  userInfo:     UserInfo;
  _id:          string;
  roomId:       RoomInfo;
  checkInDate:  Date;
  checkOutDate: Date;
  peopleNum:    number;
  orderUserId:  string;
  status:       number;
  createdAt:    Date;
  updatedAt:    Date;
}

export interface RoomInfo {
  name:         string;
  description:  string;
  imageUrl:     string;
  imageUrlList: string[];
  areaInfo:     string;
  bedInfo:      string;
  maxPeople:    number;
  price:        number;
  status:       number;
  layoutInfo:   Info[];
  facilityInfo: Info[];
  amenityInfo:  Info[];
  _id:          string;
  createdAt:    Date;
  updatedAt:    Date;
}

export interface Info {
  title:     string;
  isProvide: boolean;
}
