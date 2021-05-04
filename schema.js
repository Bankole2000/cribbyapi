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
    allUsers: [User]
    me: User
    allListings: [Listing]
    allCurrencyCodes: [CurrencyCode]
    currencyDetails(code: CurrencyCode): Currency
    getHobbies(title: String, description: String, emoticon: String): [Hobby]
  }

  type Mutation {
    """
    Mutation to Signup Users
    """
    signUp(credentials: UserInput): AuthPayload
    """
    User sign in with username (or email) and password
    """
    signIn(credentials: Credentials!): AuthPayload
    deleteUser(userUUID: String!): User
    signOut: AuthPayload
    """
    Update Core user details - email, username, dob, gender - required login or ADMIN role
    If user email changed, sets email verification status to false and sends verification token to new email address
    """
    updateUser(userUUID: String!, updateData: UserUpdateInput): User
    """
    Update User profile details (firstname, lastname, hobbies etc)
    User must be logged in or have ADMIN role
    """
    updateUserProfile(userUUID: String, updateData: ProfileInput): User
    addListing(listing: ListingInput): Listing @requiresLogin
    updateListing(listingUUID: String, updateData: ListingInput): Listing
      @requiresLogin
    deleteListing(listingUUID: String): Listing @requiresLogin
    toggleListingPublishedStatus(uuid: String): Listing
    """
    Add or Update Hobbies (include ID (id) field to update, exclude to create)
    """
    addOrUpdateHobby(hobby: HobbyInput): Hobby
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
    """
    Roles - Enum for access control
    """
    roles: [Role]
    profile: Profile
    agentProfile: Agent
    isOnline: Boolean
    lastSeen: String
    lastLogin: String
    listings: [Listing]
    bookings: [Booking]
    supportProfile: Support
    createdAt: String
    updatedAt: String
  }

  input UserUpdateInput {
    email: String
    username: String
    dob: String
    gender: String
  }

  input ProfileInput {
    uuid: String
    firstname: String
    lastname: String
    phone: String
    bio: String
    hobbies: [HobbyInput]
    instagramHandle: String
    twitterHandle: String
    snapchatUrl: String
    facebookUrl: String
    websiteUrl: String
  }

  type Hobby {
    id: ID
    uuid: String
    title: String
    description: String
    emoticon: String
    profiles: [Profile]
  }

  input HobbyInput {
    id: ID
    title: String!
    description: String!
    emoticon: String!
  }
  """
  Basic Profile for User Object
  """
  type Profile {
    id: ID
    uuid: String
    profileImageUrl: String
    profileImagePath: String
    identityCardImageUrl: String
    identityVerified: Boolean
    IdentityVerifiedById: Int
    IdentityVerifiedAt: String
    firstname: String
    lastname: String
    phone: String
    phoneIsVerified: Boolean
    bio: String
    instagramHandle: String
    twitterHandle: String
    snapchatUrl: String
    facebookUrl: String
    websiteUrl: String
    user: User
    userId: Int
    hobbies: [Hobby]
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
    title: String
    shortDescription: String
    longDescription: String
    additionalRules: [String]
    baseCurrency: Currency
    basicPrice: Float
    pricePerWeekend: Float
    pricePerWeek: Float
    pricePerMonth: Float
    isPublished: Boolean
    owner: User
    ownerId: Int
    images: [ListingImage]
    bookings: [Booking]
    createdAt: String
    updatedAt: String
  }

  input ListingInput {
    title: String!
    shortDescription: String
    longDescription: String
    additionalRules: [String]
    basicPrice: Float
    pricePerWeekend: Float
    pricePerWeek: Float
    pricePerMonth: Float
    houseRules: [HouseRule]
  }

  input HouseRule {
    id: ID
    uuid: String
    title: String
    shortDescription: String
    longDescription: String
    code: String
    faIcon: String
    mdiIcon: String
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

  input Credentials {
    email: String
    password: String
    username: String
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Currency {
    symbol: String
    name: String
    pluralName: String
    nativeSymbol: String
    code: CurrencyCode
    decimalDigits: Int
    rounding: Int
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

  enum CurrencyCode {
    USD
    AED
    AFN
    ALL
    AMD
    ANG
    AOA
    ARS
    AUD
    AWG
    AZN
    BAM
    BBD
    BDT
    BGN
    BHD
    BIF
    BMD
    BND
    BOB
    BRL
    BSD
    BWP
    BYR
    BZD
    CAD
    CDF
    CHF
    CLP
    CNY
    COP
    CRC
    CVE
    CZK
    DJF
    DKK
    DOP
    DZD
    EEK
    EGP
    ERN
    ETB
    EUR
    FJD
    FKP
    GBP
    GEL
    GHS
    GIP
    GMD
    GNF
    GTQ
    GYD
    HKD
    HNL
    HRK
    HTG
    HUF
    IDR
    ILS
    INR
    IQD
    IRR
    ISK
    JMD
    JOD
    JPY
    KES
    KSG
    KHR
    KMF
    KRW
    KWD
    KYD
    KZT
    LAK
    LBP
    LKR
    LRD
    LSL
    LTL
    LVL
    LYD
    MAD
    MDL
    MGA
    MKD
    MMK
    MNT
    MOP
    MRO
    MUR
    MVR
    MWK
    MXN
    MYR
    MZN
    NAD
    NGN
    NIO
    NOK
    NPR
    NZD
    OMR
    PAB
    PEN
    PGK
    PHP
    PKR
    PLN
    PYG
    QAR
    RON
    RSD
    RUB
    RWF
    SAR
    SBD
    SCR
    SDG
    SEK
    SGD
    SHP
    SLL
    SOS
    SRD
    STD
    SVC
    SYP
    SZL
    THB
    TJS
    TND
    TOP
    TRY
    TTD
    TWD
    TZS
    UAH
    UGX
    UYU
    UZS
    VEF
    VND
    VUV
    WST
    XAF
    XCD
    XOF
    XPF
    YER
    ZAR
    ZMK
    ZMW
  }
`;
