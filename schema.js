const { gql } = require("apollo-server");

module.exports = gql`
  directive @requiresLogin on FIELD_DEFINITION
  directive @requiresAdmin on FIELD_DEFINITION
  directive @requiresSupport on FIELD_DEFINITION
  directive @requiresOwnership on FIELD_DEFINITION

  type Query {
    """
    Get all users (Required Admin Access)
    """
    allUsers: [User] @requiresLogin
    me: User
  }

  type Mutation {
    """
    Mutation to Signup Users
    """
    signUp(credentials: UserInput): AuthPayload
    signIn(credentials: Credentials!): AuthPayload
    deleteUser(uuid: String!): User
    signOut: AuthPayload
  }

  type Subscription {
    favorites: FavoriteCount
    userLoggedIn: User
    userSignedUp: User
  }

  type FavoriteCount {
    sessionId: ID
    count: Int
  }
  """
  Base User ObjectType
  """
  type User {
    id: ID
    uuid: String
    email: String
    emailIsVerified: Boolean
    emailVerificationToken: String
    """
    Date of Birth in format 'YYYY-MM-DD' - Must be above 18yrs to signup
    """
    dob: String
    """
    Terms of Service Acceptance - Must be true to signup
    """
    tos: Boolean
    """
    User gender - Can be 'male', 'female', or 'prefer not to say'
    """
    gender: String
    """
    Username - Unique Identifier for signup + login
    """
    username: String
    roles: [Role]
    profile: Profile
    agentProfile: Agent
    listings: [Listing]
    bookings: [Booking]
    supportProfile: Support
    createdAt: String
    updatedAt: String
  }
  """
  Basic Profile for User Object
  """
  type Profile {
    id: ID
    profileImageUrl: String
    profileImagePath: String
    identityCardImageUrl: String
    identityVerified: Boolean
    IdentityVerifiedById: Int
    IdentityVerifiedAt: String
    firstname: String
    lastname: String
    phone: String
    bio: String
    user: User
    userId: Int
    createdAt: String
    updatedAt: String
  }
  """
  Required Info for User signup
  """
  input UserInput {
    email: String!
    """
    Date of birth in format "YYYY-MM-DD". Must be above 18yrs to sign up
    """
    dob: String!
    """
    Terms of Service acceptance - Must be true to to signup
    """
    tos: Boolean!
    gender: String!
    username: String!
    password: String!
  }
  """
  Required Info for Agent Status request
  """
  input AgentInput {
    userId: Int
    agentEmail: String
    agentPhone: String
  }
  """
  Details of Users with "Agent" Role
  """
  type Agent {
    id: ID
    uuid: String
    company: Company
    companyId: Int
    licenseUrl: String
    licenseIsImage: Boolean
    licenseIsUpload: Boolean
    licenseFilePath: String
    approved: Boolean
    approvedAt: String
    approvedBy: Support
    approvedById: Int
    user: User
    userId: Int
    agentEmail: String
    agentPhone: String
    agentEmailIsVerified: Boolean
    agentPhoneIsVerified: Boolean
    rentals: [Rental]
    createdAt: String
    updatedAt: String
  }
  """
  Details of Companies that agents work with
  """
  type Company {
    id: ID
    uuid: String
    email: String
    name: String
    websiteUrl: String
    address: String
    locationCity: String
    locationState: String
    locationCountry: String
    phone: String
    agents: [Agent]
    createdAt: String
    updatedAt: String
  }

  """
  Rentals posted by Agents
  """
  type Rental {
    id: ID
    uuid: String
    isPublished: Boolean
    title: String
    shortDesc: String
    agent: Agent
    agentId: Int
    images: [RentalImage]
    createdAt: String
    updatedAt: String
  }
  """
  Details of Images for Rentals
  """
  type RentalImage {
    id: ID
    imageIndex: Int
    uuid: String
    imageResizedUrl: String
    imageFullsizeUrl: String
    imageResizedPath: String
    imageFullSizedPath: String
    rental: Rental
    rentalId: Int
    createdAt: String
    updatedAt: String
  }

  """
  Details of Users with "Support" Role
  """
  type Support {
    id: ID!
    uuid: String
    agentApprovals: [Agent]
    profileVerifications: [Profile]
    userData: User
    userDataId: Int
    createdAt: String
    updatedAt: String
  }

  """
  Details of Listings posted by Users
  """
  type Listing {
    id: ID!
    uuid: String
    owner: User
    ownerId: Int
    images: [ListingImage]
    bookings: [Booking]
    isPublished: Boolean
    createdAt: String
    updatedAt: String
  }

  """
  Details of Images associated with posted Listings
  """
  type ListingImage {
    id: ID!
    uuid: String
    index: Int
    createdAt: String
    updatedAt: String
    Listing: Listing
    ListingId: Int
  }

  """
  Details of Bookings made by "Users"
  """
  type Booking {
    id: ID!
    uuid: String
    listing: Listing
    listingId: Int
    guest: User
    guestId: Int
    createdAt: String
    updatedAt: String
  }

  """
  Possible Roles available to users - Users can have multiple roles
  """
  enum Role {
    USER
    AGENT
    SUPPORT
    ADMIN
  }

  input Credentials {
    email: String
    password: String
    username: String
  }

  type AuthPayload {
    token: String
    user: User
  }
`;
