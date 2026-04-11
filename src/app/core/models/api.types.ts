/** Laravel paginated JSON Resource collection */
export interface Paginated<T> {
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
  username: string;
  email: string;
  activated?: boolean;
  createdAt?: string;
  gravatar: string;
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
  following: number;
  followers: number;
  micropost: number;
  gravatar: string;
}

export interface MicropostJson {
  id: number;
  content: string;
  createdAt: string;
  imageUrl: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    gravatar: string;
  } | null;
}

export interface LoginResponseJson {
  user: UserJson;
  token: string;
}
