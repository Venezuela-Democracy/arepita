# VenezuelaDAO 🇻🇪

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Telegram Bot](https://img.shields.io/badge/Telegram-Bot-blue.svg)](https://t.me/VenezuelaDAOBot)
[![Railway](https://img.shields.io/badge/Railway-Deployed-success)](https://railway.app)
[![Flow](https://img.shields.io/badge/Flow-Blockchain-00ef8b)](https://flow.com)

VenezuelaDAO is an innovative educational platform that combines blockchain technology, gamification, and social interaction to teach people about Decentralized Autonomous Organizations (DAOs) through a regional governance simulation focused on Venezuela.

## 🎯 Project Overview

VenezuelaDAO creates an engaging learning environment where participants can:

- Learn about DAOs through practical experience
- Participate in regional governance simulations
- Collect and manage NFTs representing different aspects of Venezuela
- Engage with other community members through Telegram groups
- Make decisions that impact virtual regional development

## 🤖 Telegram Integration

The platform is primarily accessed through a Telegram bot that provides:

- **Multi-language Support**: Currently supports Spanish and English
- **Regional Groups**: Automated management of state-specific Telegram groups
- **Interactive Commands**: Easy-to-use commands for all platform features
- **Real-time Notifications**: Updates about governance events and NFT activities
- **Community Management**: Automated moderation and user verification

### Available Commands

- `/start` - Begin your journey and select language
- `/register` - Register and get your first NFTs
- `/help` - View available commands and guidance
- `/status` - Check your current status
- `/balance` - View your points balance
- `/wallet` - Access wallet information
- `/collection` - View your NFT collection

## 🎮 Game Mechanics & Narrative

### Current NFT Collection

1. **Location Cards** 🏛️
   - **States**: 23 states + 1 Capital District
   - **Cities**: Major cities from each state
   - **Historical Sites**: Iconic locations like Angel Falls, Morrocoy, etc.
   - **Rarity Levels**: Common, Uncommon, Rare, Epic, Legendary
   - **Special Properties**: Resource generation multipliers, regional bonuses

2. **Historical Character Cards** 👥
   - **Independence Heroes**: Simón Bolívar, Francisco de Miranda, etc.
   - **Cultural Icons**: Artists, writers, musicians
   - **Modern Leaders**: Notable political and social figures
   - **Special Abilities**: Governance power boosts, crisis management bonuses

3. **Cultural Heritage NFTs** 🎭
   - **Traditions**: Local festivals and celebrations
   - **Gastronomy**: Traditional dishes and ingredients
   - **Artistry**: Folk art and crafts
   - **Music**: Traditional instruments and dances

### Future Narrative Expansion (Coming Soon)

The platform will introduce an immersive narrative experience that includes:

- **Historical Storylines**: Interactive missions based on Venezuelan history
- **Regional Challenges**: State-specific events and crises
- **Community Missions**: Collaborative tasks requiring regional coordination
- **Dynamic Events**: Real-time responses to community decisions
- **Achievement System**: Rewards for completing historical milestones

## 🏗️ Technical Architecture

### Smart Contracts
- NFT management system
- Resource generation mechanics
- Governance mechanisms
- Crisis management system

### Backend Services
- Express.js API
- MongoDB database
- Telegram bot integration
- Blockchain interaction layer

### Security Features
- JWT authentication
- Rate limiting
- Telegram webhook verification
- Smart contract access control

## 🔄 System Architecture

```mermaid
graph TD
subgraph Telegram Layer
T[Telegram Users] -->|Commands| B[Telegram Bot]
B -->|Webhook| API[Express API]
end
subgraph Backend Services
API -->|Process Commands| H[Command Handler]
H -->|User Management| DB[(MongoDB)]
H -->|Blockchain Ops| FCL[Flow Client Library]
end
subgraph Flow Blockchain
FCL -->|Transactions| F[Flow Network]
F -->|NFT Operations| NFT[VenezuelaDAO NFTs]
F -->|State Changes| State[Game State]
end
style F fill:#00ef8b,stroke:#333,stroke-width:2px
style FCL fill:#00ef8b,stroke:#333,stroke-width:2px
style NFT fill:#00ef8b,stroke:#333,stroke-width:2px
```

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Bot
    participant API
    participant Flow
    
    User->>Bot: /start command
    Bot->>API: Create session
    API->>Flow: Generate wallet
    Flow-->>API: Wallet created
    API-->>Bot: Session info
    Bot-->>User: Welcome & wallet info
    
    Note over User,Flow: Flow integration enables<br/>seamless onboarding
```

## 🎮 User Journey

```mermaid
graph LR
    subgraph User Actions
    A[Start Bot] -->|Register| B[Join Region]
    B -->|Daily Tasks| C[Earn Points]
    C -->|Participate| D[DAO Governance]
    end
    
    subgraph Flow Integration
    C -->|Generate| E[Resources]
    D -->|Manage| F[NFTs]
    E -->|Power| D
    end
    
    style E fill:#00ef8b,stroke:#333,stroke-width:2px
    style F fill:#00ef8b,stroke:#333,stroke-width:2px
```

## 📡 Command Processing

```mermaid
stateDiagram-v2
    [*] --> Received
    Received --> Processing: Webhook
    Processing --> FlowTransaction: NFT Operation
    Processing --> DatabaseUpdate: User Update
    Processing --> Response: Info Command
    FlowTransaction --> Completed
    DatabaseUpdate --> Completed
    Response --> Completed
    Completed --> [*]
    
    note right of FlowTransaction
        Flow Blockchain Integration
    end note
```
## 🚀 Getting Started

### Prerequisites
- bash
- Node.js v16+
- MongoDB
- Telegram Bot Token

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/venezueladao.git
cd venezueladao
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
## 🎓 Educational Impact

VenezuelaDAO serves as an educational tool to help people understand:

- How DAOs work in practice through hands-on participation
- Blockchain technology and NFTs in a cultural context
- Digital governance mechanisms and voting systems
- Community coordination and consensus building
- Regional development dynamics and resource management
- Venezuelan history, culture and traditions
- Economic principles through gamified mechanics

## 🤝 Contributing

We welcome contributions from developers, designers, writers and community members! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Code contributions
- Documentation improvements
- Translation help
- Community management
- Content creation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛠️ Development Status

### Completed ✅
- Smart Contract Architecture
- NFT Collection Design & Metadata
- Telegram Bot Core Functions
- Basic Game Mechanics
- Resource Generation System
- User Authentication Flow

### In Progress 🔄
- Narrative System Development
- Community Features Implementation
- Regional Events Engine
- Achievement System
- Multi-language Support Enhancement

### Planned 📅
- Historical Missions System
- Advanced Crisis Management
- Inter-regional Trading
- Governance Proposals Framework
- Educational Content Integration
- Mobile App Development

## 🗺️ Roadmap

### Q4 2024
- Launch beta version with core features
- Deploy initial NFT collection
- Release basic Telegram bot functionality

### Q1 2025
- Implement narrative system
- Add regional events
- Expand NFT collections
- Launch governance features

### Q2 2025
- Release mobile app
- Add advanced game mechanics
- Implement cross-regional interactions
- Launch educational content portal

### Q3 2025
- Scale to other regions
- Implement advanced DAO features
- Launch economic simulation features
- Develop AR/VR experiences

## 🙏 Acknowledgments

Special thanks to:
- Flow Blockchain team for technical support
- Telegram Bot API team
- Venezuelan community members and testers
- All contributors and supporters

## 📞 Contact & Community

- Telegram: [@VenezuelaDAOBot](https://t.me/VenezuelaDAOBot)

### Regional Communities
- Caracas: [@VDAOCaracas](https://t.me/VDAOCaracas)
- Maracaibo: [@VDAOMaracaibo](https://t.me/VDAOMaracaibo)
- Valencia: [@VDAOValencia](https://t.me/VDAOValencia)


---

Built with ❤️ for Venezuela 🇻🇪

Join us in building the future of regional governance and education through blockchain technology!