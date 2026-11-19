public function updateProfile(string $name, string $email): User
    {
        $users = $this->readJson($this->usersFile);
        $updated = null;
        foreach ($users as &$row) {
            if ((int)$row['id'] === 1) {
                $member = $this->hydrateUser($row);
                $member->setName($name);
                $member->setEmail($email);
                $row = $member->toStorageArray();
                $updated = $member;
                break;
            }
        }
        $this->writeJson($this->usersFile, $users);
        return $updated;
    }

    public function toggleFavorite(int $bookId): array
    {
        $users = $this->readJson($this->usersFile);
        $favorites = [];
        foreach ($users as &$row) {
            if ((int)$row['id'] === 1) {
                $member = $this->hydrateUser($row);
                if ($member instanceof Member) {
                    $member->toggleFavorite($bookId);
                    $favorites = $member->getFavorites();
                    $row = $member->toStorageArray();
                }
                break;
            }
        }
        $this->writeJson($this->usersFile, $users);
        return $favorites;
    }

    public function getMembersForTable(): array
    {
        $transactions = $this->readJson($this->transactionsFile);
        $rows = [];
        foreach ($this->readJson($this->usersFile) as $u) {
            $user = $this->hydrateUser($u);
            if ($user instanceof Member) {
                $count = count(array_filter($transactions, fn($t) => (int)($t['member_id'] ?? 1) === $user->getId()));
                $rows[] = [$user->getName(), $user->getEmail(), $user->getJoinedAt(), (string)$count, $user->getStatus()];
            }
        }
        return $rows;
    }

    public function getMemberFavorites(): array
    {
        foreach ($this->readJson($this->usersFile) as $u) {
            if ((int)$u['id'] === 1) {
                return $u['favorites'] ?? [2, 5, 7];
            }
        }
        return [2, 5, 7];
    }