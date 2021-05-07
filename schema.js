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
    users: [User]
    me: User
    listings: [Listing]
    currencies: [Currency]
    countries(
      name: String
      currencyCode: CurrencyCode
      continentCode: ContinentCode
      continent: String
      currencyCode: CurrencyCode
    ): [Country]
    currencyCodes: [CurrencyCode]
    countryCodes: [CountryCode]
    statesByCountry(countryCode: CountryCode!): [State]
    citiesByState(countryCode: CountryCode!, stateCode: String!): [City]
    continentCodes: [ContinentCode]
    currencyDetails(code: CurrencyCode): Currency
    hobbies(title: String, description: String, emoticon: String): [Hobby]
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
    toggleListingPublishedStatus(listingUUID: String): Listing @requiresLogin
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
    basicPrice(currency: CurrencyCode!): Float
    pricePerWeekend(currency: CurrencyCode!): Float
    pricePerWeek(currency: CurrencyCode!): Float
    pricePerMonth(currency: CurrencyCode!): Float
    guestCapacity: Int
    guestArrivalDaysNotice: Int
    guestBookingMonthsInAdvance: Int
    bookingStayDaysMin: Int
    bookingStayDaysMax: Int
    locationCountry: String
    countryCode: CountryCode
    locationState: String
    stateCode: String
    locationCity: String
    latitude: Float
    longitude: Float
    amenities: [ListingAmenity]
    isPublished: Boolean
    owner: User
    ownerId: Int
    images: [ListingImage]
    bookings: [Booking]
    createdAt: String
    updatedAt: String
    requestedCurrency(currency: CurrencyCode!): Currency
  }

  input ListingInput {
    title: String!
    shortDescription: String
    longDescription: String
    additionalRules: [String]
    baseCurrency: CurrencyCode
    basicPrice: Float
    pricePerWeekend: Float
    pricePerWeek: Float
    pricePerMonth: Float
    guestCapacity: Int
    guestArrivalDaysNotice: Int
    guestBookingMonthsInAdvance: Int
    bookingStayDaysMin: Int
    bookingStayDaysMax: Int
    locationCountry: String
    countryCode: CountryCode
    locationState: String
    stateCode: String
    locationCity: String
    latitude: Float
    longitude: Float
    houseRules: [HouseRule]
  }

  type ListingAmenity {
    id: ID
    uuid: String
    name: String
    category: String
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

  type Country {
    tld: String
    name: String
    countryCode: CountryCode
    continent: String
    continentCode: ContinentCode
    capital: String
    currencyCode: CurrencyCode
    currency: Currency
    latitude: Float
    longitude: Float
    emoji: String
    emojiU: String
    phoneCode: String
    states: [State]
    subregion: String
  }

  type State {
    name: String
    stateCode: String
    countryCode: CountryCode
    countryName: String
    latitude: Float
    longitude: Float
    cities: [City]
  }

  type City {
    name: String
    stateCode: String
    stateName: String
    countryCode: CountryCode
    countryName: String
    latitude: Float
    longitude: Float
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

  enum ListingPurpose {
    RESIDENTIAL
    COMMERCIAL
    EVENTS
    ANY
  }

  enum ListingType {
    ENTIRE_PLACE
    PRIVATE_ROOM
    SHARED_ROOM
  }

  enum ContinentCode {
    AS
    EU
    AN
    AF
    OC
    NA
    SA
  }

  enum CountryCode {
    BD
    BE
    BF
    BG
    BA
    BB
    WF
    BL
    BN
    BO
    BH
    BI
    BJ
    JM
    BV
    BW
    WS
    BQ
    BR
    BS
    JE
    BY
    BZ
    RU
    RW
    RS
    TL
    RE
    TM
    TJ
    RO
    TK
    GW
    GU
    GT
    GS
    GR
    GQ
    GP
    JP
    GY
    GG
    GF
    GE
    GD
    GB
    GA
    SV
    GN
    GM
    GL
    GI
    GH
    OM
    TN
    JO
    HR
    HT
    HU
    HK
    HN
    HM
    PR
    PS
    PW
    PT
    SJ
    PY
    IQ
    PA
    PF
    PG
    PE
    PK
    PH
    PN
    PL
    PM
    EH
    EE
    EG
    ZA
    EC
    IT
    VN
    SB
    ET
    SO
    SA
    ES
    ER
    ME
    MD
    MG
    MF
    MA
    MC
    UZ
    MM
    ML
    MO
    MN
    MH
    MK
    MU
    MT
    MW
    MQ
    MP
    MS
    IM
    UG
    TZ
    MY
    MX
    IL
    FR
    IO
    SH
    FI
    FJ
    FK
    FM
    FO
    NI
    NL
    NO
    NA
    VU
    NC
    NE
    NF
    NG
    NZ
    NP
    NR
    NU
    CK
    XK
    CI
    CH
    CO
    CN
    CM
    CL
    CC
    CA
    CG
    CF
    CD
    CZ
    CY
    CX
    CR
    CV
    SY
    KE
    SR
    KI
    KH
    KN
    KM
    SK
    KR
    SI
    KW
    SN
    SM
    SL
    KZ
    KY
    SG
    SE
    SD
    DO
    DM
    DJ
    DK
    VG
    DE
    YE
    DZ
    US
    UY
    YT
    UM
    LB
    LC
    TV
    TW
    TT
    TR
    LK
    LI
    LV
    TO
    LT
    LU
    LR
    TH
    TF
    TG
    TD
    TC
    LY
    VA
    VC
    AE
    AD
    AG
    AF
    AI
    VI
    IS
    IR
    AM
    AL
    AO
    AS
    AR
    AU
    AT
    AW
    IN
    AX
    AZ
    IE
    ID
    UA
    QA
    MZ
  }

  enum CurrencyCode {
    USD
    AED
    AFN
    ALL
    AMD
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
    KHR
    KMF
    KRW
    KWD
    KYD
    KZT
    LBP
    LKR
    LRD
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
    MUR
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
    SDG
    SEK
    SGD
    SHP
    SLL
    SOS
    SRD
    STN
    SVC
    SYP
    THB
    TJS
    TMT
    TND
    TOP
    TRY
    TTD
    TVD
    TWD
    TZS
    UAH
    UGX
    UYU
    UZS
    VES
    VND
    VUV
    WST
    XAF
    XCD
    XOF
    XPF
    YER
    ZAR
    ZMW
  }
`;
