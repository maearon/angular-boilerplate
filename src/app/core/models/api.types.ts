/** Laravel paginated JSON Resource collection */
export interface Paginated<T> {
  feed_items: T[]; // renamed from `data` to `feed_items` to avoid confusion with other APIs
  total_count: number; // renamed from `meta.total` to `total_count` for clarity
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface UserJson {
  id: number;
  name: string;
  // username: string;
  email: string;
  // activated?: boolean;
  // createdAt?: string;
  // gravatar: string;
  admin: boolean;
  token: string;
  avatar?: string | '';
  passwordHash?: string;
}

export interface UserProfileJson extends UserJson {
  following: number;
  followers: number;
  micropost: number;
  currentUserFollowingUser: boolean;
}

export interface CurrentUserJson {
  id: number;
  name: string;
  email: string;
  following: number | 0;
  followers: number | 0;
  micropost: number | 0;
  // gravatar: string;
  role: boolean;
  avatar: string;
  token: string;
}

export type SessionResponse = {
  user: CurrentUserJson
}

export interface MicropostJson {
  id: number;
  content: string;
  createdAt: string;
  imageUrl: string | null;
  gravatar_id: string;
  user_name: string;
  user_id: string;
  timestamp: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar: string;
  } | null;
}

export interface LoginResponseJson {
  user: UserJson;
  // token: string;
  tokens: {
    access: {
      token: string;
      expires: string;
    };
    refresh: {
      token: string;
      expires: string;
    };
  };
}
